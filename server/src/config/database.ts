import { Prisma, PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

let prisma: PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'>;

const prismaOptions: Prisma.PrismaClientOptions = {
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
};

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'>(
    prismaOptions
  );
} else {
  // Prevent multiple instances of Prisma Client in development HMR
  const globalWithPrisma = global as typeof globalThis & {
    prisma?: PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'>;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient<
      Prisma.PrismaClientOptions,
      'query' | 'info' | 'warn' | 'error'
    >(prismaOptions);
  }
  prisma = globalWithPrisma.prisma;
}

// Bind logging handlers to Winston Logger
prisma.$on('query', (e) => {
  logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on('info', (e) => {
  logger.info(`Prisma Info: ${e.message}`);
});

prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

export { prisma };
