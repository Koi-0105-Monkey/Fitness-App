import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Conversation from '../models/Conversation.model';
import Message from '../models/Message.model';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Lấy danh sách các cuộc hội thoại (Cho Admin)
// @route   GET /api/chat/conversations
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await Conversation.find()
    .populate('participants', 'fullName avatarUrl role')
    .sort({ updatedAt: -1 });
    
  sendSuccess(res, conversations, 'Lấy danh sách hội thoại thành công');
});

// @desc    Lấy lịch sử tin nhắn của một cuộc hội thoại
// @route   GET /api/chat/messages/:conversationId
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 });
    
  sendSuccess(res, messages, 'Lấy lịch sử tin nhắn thành công');
});

// @desc    Lấy hoặc tạo hội thoại giữa User và Admin
// @route   GET /api/chat/init/:userId
export const initConversation = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  // Tìm cuộc hội thoại hiện có (Giả định 1 user chỉ có 1 thread với support team)
  // Thực tế có thể phức tạp hơn, nhưng ở đây tối giản
  let conversation = await Conversation.findOne({
    participants: { $in: [new mongoose.Types.ObjectId(userId as string)] }
  }).populate('participants', 'fullName avatarUrl role');

  sendSuccess(res, conversation, 'Khởi tạo hội thoại thành công');
});
