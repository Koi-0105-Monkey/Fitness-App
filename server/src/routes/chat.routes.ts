import express from 'express';
import * as chatController from '../controllers/chat.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// Tất cả các API chat đều cần đăng nhập
router.use(verifyToken);

router.get('/conversations', chatController.getConversations);
router.get('/messages/:conversationId', chatController.getMessages);
router.get('/init/:userId', chatController.initConversation);

export default router;
