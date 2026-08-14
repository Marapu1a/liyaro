import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';

import { registerErrorHandler } from './common/error-handler.js';
import { env } from './config/env.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { inquiryRoutes } from './modules/inquiries/inquiry.routes.js';
import prismaPlugin from './plugins/prisma.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    bodyLimit: 32 * 1024,
    // Production traffic reaches Fastify only through Caddy on the private
    // Compose network, so forwarded client addresses can be trusted here.
    trustProxy: env.NODE_ENV === 'production',
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  registerErrorHandler(app);

  await app.register(cors, {
    origin: env.FRONTEND_URL,
  });
  await app.register(rateLimit, {
    global: false,
  });
  await app.register(prismaPlugin);
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(inquiryRoutes, { prefix: '/api' });

  return app;
}
