import express from 'express';
import cors from 'cors';
import analysisRoutes from './routes/analysis.routes.js';
import { logger } from './utils/logger.js';

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Mount analysis routes under both /api and root /
app.use('/api', analysisRoutes);
app.use('/', analysisRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${req.method} ${req.originalUrl}] Error:`, message);

  res.status(statusCode).json({
    success: false,
    error: message,
  });
});

export default app;
