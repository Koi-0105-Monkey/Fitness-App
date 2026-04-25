import express from 'express';
import * as workoutController from '../controllers/workout.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// Bơm dữ liệu (Cho Admin/Dev)
router.post('/seed', workoutController.seedWorkouts);

// Tất cả các API còn lại yêu cầu đăng nhập
router.use(verifyToken);

router.get('/training-of-day', workoutController.getTrainingOfDay);
router.get('/', workoutController.getWorkouts);
router.get('/:id', workoutController.getWorkoutById);

export default router;
