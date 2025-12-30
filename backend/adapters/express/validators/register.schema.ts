import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    role: z.enum(['admin', 'kitchen', 'delivery']),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
