import { buildApp } from './app.js';
import { env } from './config/env.js';

const app = await buildApp();

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  app.log.info({ signal }, 'Shutting down');

  try {
    await app.close();
    process.exit(0);
  } catch (error) {
    app.log.error(error, 'Failed to shut down cleanly');
    process.exit(1);
  }
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ port: env.BACKEND_PORT, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exit(1);
}
