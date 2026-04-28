import express from 'express';
import * as workoutController from '../controllers/workout.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// API Quản lý bài tập (Mở Public để Admin dễ thao tác)
router.get('/', workoutController.getWorkouts);
router.get('/:id', workoutController.getWorkoutById);
router.post('/', workoutController.createWorkout);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

// Các API khác yêu cầu đăng nhập
router.use(verifyToken);

router.get('/recommendations', workoutController.getRecommendations);
router.get('/training-of-day', workoutController.getTrainingOfDay);

export default router;
