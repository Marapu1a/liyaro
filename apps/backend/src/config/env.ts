import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: new URL('../../../../.env', import.meta.url), quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FRONTEND_URL: z.url().default('http://localhost:4321'),
  BACKEND_PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  DATABASE_URL: z.string().min(1).default('postgresql://liyaro:liyaro@localhost:5432/liyaro'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', z.flattenError(parsedEnv.error).fieldErrors);
  throw new Error('Environment validation failed');
}

export const env = parsedEnv.data;
