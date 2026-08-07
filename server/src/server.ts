import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const server = http.createServer(app);

const startServer = () => {
  server.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed.');
    // Future database connection closures go here
    process.exit(0);
  });

  // Enforce termination timeout after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcing shut down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
