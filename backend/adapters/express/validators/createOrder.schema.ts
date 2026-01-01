import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(1),
    phone: z.string().min(1),
    deliveryAddress: z.string().min(1),
    items: z.array(z.object({
      menuItemId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })).min(1),
    paymentMethod: z.enum(['card', 'cash']).optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
