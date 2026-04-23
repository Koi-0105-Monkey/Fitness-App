import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT ?? 5000;

const httpServer = http.createServer(app);

// ─── Socket.io setup (cho Online Support chat) ──────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join_room', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  socket.on('send_message', (data: { conversationId: string; message: string; senderId: string }) => {
    // Broadcast đến room (Admin và User đều nhận)
    io.to(data.conversationId).emit('receive_message', {
      ...data,
      createdAt: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── Start server ──────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 FITBODY Server running on port ${PORT}`);
    console.log(`📡 Socket.io listening on port ${PORT}`);
  });
};

start();
