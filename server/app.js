import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import reviewRoutes from './routes/reviewRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors());

// Rate limiter: 120 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use(limiter);

// Express JSON body parser for JSON endpoints
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'ReviewLens Backend API',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  });
});

// Review routes
app.use('/api/reviews', reviewRoutes);

// Central error handler
app.use(errorHandler);

export default app;
