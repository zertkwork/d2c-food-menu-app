import { api, Header } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { handlePaystackWebhook } from "../core/order/webhook_service";

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
    return await handlePaystackWebhook({
      event: req.event,
      data: req.data,
      signature: req.signature as any,
      paystackSecret: paystackSecretKey(),
    });
  }
);
