import { envSchema } from './env.schema';

const parsed = envSchema.safeParse(process.env as any);
if (!parsed.success) {
  // Fail fast on startup with validation errors
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export default env;
