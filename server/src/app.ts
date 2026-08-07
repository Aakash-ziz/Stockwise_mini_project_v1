import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import v1Router from './routes/v1/index.js';

const app = express();

// Enable Helmet for security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// Enable Gzip compression
app.use(compression());

// Body parsers with size limit constraints
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting protection
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// HTTP request logger
app.use((req, _res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`);
  next();
});

// Base health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'StockWise Backend API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routing Mount
app.use('/api/v1', v1Router);

// Fallback for unmatched API routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API route not found',
    },
  });
});

// Global Error Handler
app.use(errorHandler);

export { app };
