import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { subscribeToPriceStream, priceEmitter } from './services/priceStream.service';

let ioInstance: Server;

export function initSocket(httpServer: HTTPServer): Server {
  ioInstance = new Server(httpServer, {
    cors: {
      
      origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
      
      credentials: true,
    },
  });

  // Middleware: Verify JWT before allowing the WebSocket connection
  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized: No token provided'));
    
    try {
      // Uses the same secret
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
      socket.data.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error('Unauthorized: Invalid token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const userId = socket.data.userId;

    // Add private space for user
    socket.join(`user:${userId}`);
    console.log(`[Socket] User ${userId} connected`);

    // Listen for frontend requests to track specific coin prices
    socket.on('subscribe:prices', (symbols: string[]) => {
      const cleanSymbols = symbols.map((s: string) => s.toUpperCase().trim());
      
      cleanSymbols.forEach(symbol => {
        socket.join(`price:${symbol}`);
        console.log(`[Socket] User ${userId} subscribed to ${symbol}`);
      });

      // Start the Binance WebSocket stream for these symbols
      subscribeToPriceStream(cleanSymbols);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected`);
    });
  });

  // Forward live ticks from the Binance service to all subscribed users
  priceEmitter.on('tick', (tick) => {

    // Only sends to users who joined the space for this specific symbol
    ioInstance.to(`price:${tick.symbol}`).emit('price:tick', tick);
  });

  return ioInstance;
}

export function getIO(): Server {
  if (!ioInstance) throw new Error('Socket.io not initialized');
  return ioInstance;
}