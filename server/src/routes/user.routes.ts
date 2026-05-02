import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Tất cả Routes này bị khoá bởi verifyToken -> Bắt buộc phải truyền JWT hợp lệ 
router.use(verifyToken);
router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.delete('/me', userController.deleteMe);

router.post('/me/favorites', userController.toggleFavorite);
router.get('/me/favorites', userController.getFavorites);

// Admin / Thường có thể lấy danh sách all users để ib
router.get('/', userController.getAllUsers);

export default router;
