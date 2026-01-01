import { z } from 'zod';

export const envSchema = z.object({
  PAYSTACK_SECRET_KEY: z.string().nonempty(),
  FRONTEND_URL: z.string().url().optional().default('https://proj-d411cgs82vjh7nmv7am0.lp.dev'),
  PAYMENT_MODE: z.string().optional(),
  JWT_SECRET: z.string().nonempty(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  PORT: z.preprocess((v) => {
    if (typeof v === 'string' && v.length > 0) return Number(v);
    return v;
  }, z.number().int().positive().optional()),
  INITIAL_SETUP_SECRET: z.string().optional(),
  ADAPTER_STUB_DB: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;
