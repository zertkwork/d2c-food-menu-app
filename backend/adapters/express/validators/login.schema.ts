import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
