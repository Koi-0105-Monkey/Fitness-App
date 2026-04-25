import express from 'express';
import * as workoutController from '../controllers/workout.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = express.Router();

// Bơm dữ liệu (Tạm thời mở Public để test Admin App)
router.post('/seed', workoutController.seedWorkouts);

// API Tạo bài tập mới (Tạm thời mở Public)
router.post('/', workoutController.createWorkout);

// Tất cả các API còn lại yêu cầu đăng nhập
router.use(verifyToken);

router.get('/training-of-day', workoutController.getTrainingOfDay);
router.get('/', workoutController.getWorkouts);
router.get('/:id', workoutController.getWorkoutById);

// API Tạo bài tập mới (Chỉ Admin)
router.post('/', isAdmin, workoutController.createWorkout);

export default router;
