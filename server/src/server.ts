import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import connectDB from './config/db';
import Message from './models/Message.model';
import Conversation from './models/Conversation.model';
import User from './models/User.model';
import mongoose from 'mongoose';

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
    console.log(`🔌 Socket ${socket.id} joined room: ${conversationId}`);
  });

  socket.on('admin_join_all', async () => {
    // Admin lắng nghe tất cả các phòng để nhận tin nhắn mới
    const conversations = await Conversation.find({});
    conversations.forEach(c => {
      socket.join(c._id.toString());
    });
    console.log(`👨‍💼 Admin ${socket.id} joined all conversation rooms`);
  });

  socket.on('send_message', async ({ conversationId, senderId, message, targetUserId }) => {
    try {
      let currentConvId = conversationId;
      
      // Nếu conversationId không phải là valid ObjectId, có thể là do client gửi tạm 'new_chat' hoặc 'temp_xxx'
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        // Tìm conversation cũ giữa user này và admin (mặc định lấy 1 admin)
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
          console.log('⚠️ No admin found in DB. Creating a default Support Admin...');
          admin = await User.create({
            email: 'support@fitbody.com',
            password: 'defaultpassword123', // Mật khẩu giả, admin web đang dùng mock
            fullName: 'FitBody Assistant',
            role: 'admin',
            isSetupComplete: true,
            avatarUrl: 'https://ui-avatars.com/api/?name=FitBody+Assistant&background=896CFE&color=fff'
          });
        }

        // Phân biệt ai là người gửi đầu tiên:
        // - Nếu là Web Admin chủ động nhắn trước: sẽ có targetUserId
        // - Nếu là App Mobile nhắn trước: senderId chính là User
        const partnerId = targetUserId || senderId;

        let conv = await Conversation.findOne({
          participants: { $all: [partnerId, admin._id] }
        });

        if (!conv) {
          conv = await Conversation.create({
            participants: [partnerId, admin._id],
            lastMessage: message
          });
        }
        currentConvId = conv._id.toString();
        socket.join(currentConvId); // Join vào phòng mới tạo
      }

      // 2. Lưu tin nhắn vào DB
      const newMessage = await Message.create({
        conversationId: currentConvId,
        senderId,
        message
      });

      // 3. Cập nhật lastMessage cho Conversation
      await Conversation.findByIdAndUpdate(currentConvId, {
        lastMessage: message
      });

      // 4. Broadcast đến room (Admin và User đều nhận)
      const msgPayload = {
        _id: newMessage._id,
        conversationId: currentConvId,
        message,
        senderId,
        createdAt: newMessage.createdAt,
      };

      io.to(currentConvId).emit('receive_message', msgPayload);

      // Phát cho toàn bộ admin đang kết nối (kênh admin_global) để cập nhật UI ngay lập tức
      io.to('admin_global').emit('receive_message', msgPayload);

      // Thông báo có chat mới/tin nhắn mới để admin refresh list nếu cần thiết
      io.emit('new_conversation_message', {
        conversationId: currentConvId,
      });

    } catch (error) {
      console.error('❌ Socket Error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
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
