import { api, Header } from "encore.dev/api";
import { secret } from "encore.dev/config";
import db from "../db";
import * as crypto from "crypto";
import { orderCreatedTopic } from "../events/topics";

const paystackSecretKey = secret("PaystackSecretKey");

interface PaystackWebhookRequest {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    paid_at?: string;
    metadata?: {
      orderId: number;
      trackingId: string;
    };
  };
  signature: Header<"x-paystack-signature">;
}

export const webhook = api(
  { method: "POST", path: "/orders/webhook", expose: true, auth: false },
  async (req: PaystackWebhookRequest): Promise<{ received: boolean }> => {
    const signature = req.signature;
    const eventData = {
      event: req.event,
      data: req.data,
    };

    const hash = crypto
      .createHmac("sha512", paystackSecretKey())
      .update(JSON.stringify(eventData))
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      throw new Error("Invalid signature");
    }

    if (req.event === "charge.success") {
      const { reference, status } = req.data;

      if (status === "success") {
        const orderRow = await db.queryRow<{
          id: number;
          tracking_id: string;
          customer_name: string;
          phone: string;
          delivery_address: string;
          total: number;
          customer_profile_id: number | null;
        }>`
          UPDATE orders
          SET payment_status = 'completed', order_status = 'received'
          WHERE payment_reference = ${reference}
          RETURNING id, tracking_id, customer_name, phone, delivery_address, total, customer_profile_id
        `;

        if (orderRow) {
          if (orderRow.customer_profile_id) {
            await db.exec`
              UPDATE customer_profiles
              SET 
                total_orders = total_orders + 1,
                total_spent = total_spent + ${orderRow.total},
                last_order_at = NOW()
              WHERE id = ${orderRow.customer_profile_id}
            `;
          }
          const itemsResult = [];
          for await (const item of db.query<{
            menu_item_name: string;
            quantity: number;
            price: number;
          }>`
            SELECT menu_item_name, quantity, price
            FROM order_items
            WHERE order_id = ${orderRow.id}
          `) {
            itemsResult.push(item);
          }

          await orderCreatedTopic.publish({
            orderId: orderRow.id,
            trackingId: orderRow.tracking_id,
            status: 'received',
            customerName: orderRow.customer_name,
            phone: orderRow.phone,
            deliveryAddress: orderRow.delivery_address,
            total: orderRow.total,
            items: itemsResult.map(item => ({
              menuItemName: item.menu_item_name,
              quantity: item.quantity,
              price: item.price,
            })),
            timestamp: new Date(),
          });

          console.log(`Order payment confirmed: ${reference}`);
        }
      }
    }

    return { received: true };
  }
);
