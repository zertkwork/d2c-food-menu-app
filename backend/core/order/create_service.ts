import type { DBPort } from "../db/port";

export interface OrderItem {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CreateOrderRequest {
  customerName: string;
  phone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  items: OrderItem[];
  total: number;
}

export interface CreateOrderResponse {
  orderId: number;
  trackingId: string;
  paystackAuthUrl: string;
  paystackReference: string;
}

function generateTrackingId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

async function getOrCreateCustomerProfile(db: DBPort, phone: string, customerName: string): Promise<number> {
  const existing = await db.queryRow<{ id: number }>`
    SELECT id FROM customer_profiles WHERE phone = ${phone}
  `;

  if (existing) {
    return existing.id;
  }

  const newProfile = await db.queryRow<{ id: number }>`
    INSERT INTO customer_profiles (phone, customer_name)
    VALUES (${phone}, ${customerName})
    RETURNING id
  `;

  if (!newProfile) {
    throw new Error("Failed to create customer profile");
  }

  return newProfile.id;
}

export async function createOrderService(
  req: CreateOrderRequest,
  paystackSecret: string,
  db: DBPort,
  frontendUrl: string,
  paymentModeEnv?: string
): Promise<CreateOrderResponse> {
  const trackingId = generateTrackingId();
  const paymentMode = (paymentModeEnv || '').toLowerCase() === 'stub' ? 'stub' : 'live';
  const paystackReference = paymentMode === 'stub'
    ? `stub_ref_${Date.now()}`
    : `ref-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const customerProfileId = await getOrCreateCustomerProfile(db, req.phone, req.customerName);

  const orderRow = await db.queryRow<{ id: number }>`
      INSERT INTO orders (
        tracking_id,
        customer_name,
        phone,
        delivery_address,
        delivery_instructions,
        total,
        payment_status,
        payment_reference,
        order_status,
        customer_profile_id
      ) VALUES (
        ${trackingId},
        ${req.customerName},
        ${req.phone},
        ${req.deliveryAddress},
        ${req.deliveryInstructions || null},
        ${req.total},
        'pending',
        ${paystackReference},
        'pending_payment',
        ${customerProfileId}
      )
      RETURNING id
    `;

  if (!orderRow) {
    throw new Error("Failed to create order");
  }

  for (const item of req.items) {
    await db.exec`
        INSERT INTO order_items (
          order_id,
          menu_item_id,
          menu_item_name,
          quantity,
          price,
          total
        ) VALUES (
          ${orderRow.id},
          ${item.menuItemId},
          ${item.menuItemName},
          ${item.quantity},
          ${item.price},
          ${item.total}
        )
      `;
  }

  if (paymentMode === 'stub') {
    return {
      orderId: orderRow.id,
      trackingId,
      paystackAuthUrl: 'http://localhost/stub-pay',
      paystackReference,
    };
  }
  const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${paystackSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "customer@example.com",
      amount: Math.round(req.total * 100),
      reference: paystackReference,
      callback_url: `${frontendUrl}/track-order/${trackingId}`,
      metadata: {
        orderId: orderRow.id,
        trackingId,
        customerName: req.customerName,
        phone: req.phone,
      },
    }),
  });

  if (!paystackResponse.ok) {
    const errorText = await paystackResponse.text();
    console.error("Paystack initialization failed:", errorText);
    throw new Error("Failed to initialize payment");
  }

  const paystackData = await paystackResponse.json() as {
    status: boolean;
    message: string;
    data: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  };

  return {
    orderId: orderRow.id,
    trackingId,
    paystackAuthUrl: paystackData.data.authorization_url,
    paystackReference: paystackData.data.reference,
  };
}
