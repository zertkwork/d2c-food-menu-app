// Encore runtime removed
import type { Header } from "encore.dev/api";
import { handlePaystackWebhook } from "../core/order/webhook_service";
import { orderCreatedTopic } from "../events/topics";
import { env } from "../adapters/express/config/env";

// Secrets via env only; Encore config removed

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

export async function webhook(req: PaystackWebhookRequest): Promise<{ received: boolean }> {
    const payload = await handlePaystackWebhook({
      event: req.event,
      data: req.data,
      signature: req.signature as any,
      paystackSecret: ((): string => { const v = env.PAYSTACK_SECRET_KEY; if (!v) throw new Error("Missing PAYSTACK_SECRET_KEY"); return v; })(),
    });

    if (payload) {
      await orderCreatedTopic.publish(payload);
    }

    return { received: true };
  }

