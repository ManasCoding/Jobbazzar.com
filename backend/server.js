import 'dotenv/config';
import validateEnv from './config/env.js';
import connectDB from './config/db.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

// ─── Validate environment variables ───────────────────────────────────────────
validateEnv();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();

// Security: set various HTTP headers
app.use(helmet());

// CORS — allow configured origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/['"]/g, '').replace(/\/$/, ''))
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://jobbazzar-com-frontend.vercel.app'
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      // or if the origin is in our allowed list.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        // To temporarily unblock everything during debugging, you could uncomment the next line:
        // callback(null, true); 
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// HTTP request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse incoming JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jobbazzar API is up and running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}`, routes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);      // 404 for unmatched routes
app.use(errorHandler);  // Global error handler

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `[SERVER] Running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

// ─── Unhandled Rejections ─────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error(`[UNHANDLED REJECTION] ${err.message}`);
  // Don't crash — log and continue
});

process.on('uncaughtException', (err) => {
  console.error(`[UNCAUGHT EXCEPTION] ${err.message}`);
  process.exit(1);
});
