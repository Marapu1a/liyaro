import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';

import { registerErrorHandler } from './common/error-handler.js';
import { env } from './config/env.js';
import { healthRoutes } from './modules/health/health.routes.js';
import prismaPlugin from './plugins/prisma.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  registerErrorHandler(app);

  await app.register(cors, {
    origin: env.FRONTEND_URL,
  });
  await app.register(prismaPlugin);
  await app.register(healthRoutes, { prefix: '/api' });

  return app;
}
