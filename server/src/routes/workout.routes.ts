import express from 'express';
import * as workoutController from '../controllers/workout.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// API Tạo bài tập mới (Mở Public để dev/test dữ liệu dễ dàng)
router.post('/', workoutController.createWorkout);

// Các API lấy dữ liệu vẫn yêu cầu đăng nhập
router.use(verifyToken);

router.get('/recommendations', workoutController.getRecommendations);
router.get('/training-of-day', workoutController.getTrainingOfDay);
router.get('/', workoutController.getWorkouts);
router.get('/:id', workoutController.getWorkoutById);

export default router;
