import express from 'express';
import http from 'http';
import cors from 'cors';
import { env } from './config/environment';
import { corsOptions } from './config/cors';
import { db } from './config/database';
import { errorMiddleware } from './middleware/error.middleware';
import { SocketServer } from './signaling/socket-server';
import apiRoutes from './routes/index';
import { logger } from './utils/logger';

// ─── Initialize Express App ─────────────────────────────

const app = express();
const httpServer = http.createServer(app);

// ─── Middleware ──────────────────────────────────────────

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────

app.use('/api', apiRoutes);

// ─── Socket.io Stats endpoint ───────────────────────────

app.get('/api/stats', (_req, res) => {
  try {
    const socketServer = SocketServer.getInstance();
    res.json(socketServer.getStats());
  } catch {
    res.json({
      connectedSockets: 0,
      activeRooms: 0,
      rooms: [],
    });
  }
});

// ─── Error Handling ─────────────────────────────────────

app.use(errorMiddleware);

// ─── Start Server ───────────────────────────────────────

async function start(): Promise<void> {
  try {
    // Connect to database
    await db.connect();

    // Initialize Socket.io signaling server
    SocketServer.initialize(httpServer, env.FRONTEND_URL);

    // Start HTTP server
    httpServer.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════╗
║          🚀 Velora Backend Server            ║
╠══════════════════════════════════════════════╣
║  HTTP API:    http://localhost:${env.PORT}        ║
║  WebSocket:   ws://localhost:${env.PORT}          ║
║  Environment: ${env.NODE_ENV.padEnd(30)}║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ─── Graceful Shutdown ──────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    const socketServer = SocketServer.getInstance();
    await socketServer.close();
  } catch {
    // Socket server may not be initialized
  }

  await db.disconnect();

  httpServer.close(() => {
    logger.info('Server shut down successfully');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forcefully shutting down after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
start();

export { app, httpServer };
