import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Tất cả Routes này bị khoá bởi verifyToken -> Bắt buộc phải truyền JWT hợp lệ 
router.use(verifyToken);
router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);

export default router;
