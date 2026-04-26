import express from 'express';
import * as favoriteController from '../controllers/favorite.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(verifyToken);

router.get('/', favoriteController.getFavorites);
router.post('/toggle', favoriteController.toggleFavorite);
router.get('/check/:workoutId', favoriteController.checkFavorite);

export default router;
