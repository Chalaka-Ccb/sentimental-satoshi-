import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http'; 
import { initSocket } from './socket';

// Load environment variables from the root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
// Create the HTTP server using the Express app
const httpServer = createServer(app);
// Initialize Socket.io attached to the HTTP server
const io = initSocket(httpServer);

const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1', router);
app.use(errorHandler);

// CRITICAL FIX: Listen on httpServer instead of app
httpServer.listen(PORT, () => {
  console.log(` Server + WebSocket running on port ${PORT}`);
});

export default app;