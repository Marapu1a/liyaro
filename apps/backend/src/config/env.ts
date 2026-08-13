import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: new URL('../../../../.env', import.meta.url), quiet: true });

const optionalSecret = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FRONTEND_URL: z.url().default('http://localhost:4321'),
  BACKEND_PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  DATABASE_URL: z.string().min(1).default('postgresql://liyaro:liyaro@localhost:5432/liyaro'),
  SMTP_HOST: z.string().min(1).default('smtp.yandex.ru'),
  SMTP_PORT: z.coerce.number().int().positive().max(65_535).default(465),
  SMTP_USER: z.email().default('marapulets87@yandex.ru'),
  SMTP_PASSWORD: optionalSecret,
  INQUIRY_EMAIL_TO: z.email().default('marapulets87@yandex.ru'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', z.flattenError(parsedEnv.error).fieldErrors);
  throw new Error('Environment validation failed');
}

export const env = parsedEnv.data;
