import { Request, Response } from 'express';
import Workout from '../models/Workout.model';
import Favorite from '../models/Favorite.model';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Lấy danh sách Workout (Có hỗ trợ lọc theo level)
// @route   GET /api/workouts
// @access  Private
export const getWorkouts = asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.query;
  const filter: any = {};

  if (level) {
    filter.level = level;
  }

  let workouts = await Workout.find(filter);
  
  // Shuffle ngẫu nhiên bài tập (tạm thời theo ý bạn)
  workouts = workouts.sort(() => Math.random() - 0.5);

  sendSuccess(res, workouts, 'Lấy danh sách bài tập thành công');
});

// @desc    Lấy bài tập Training of the day (Bài tập mới nhất hoặc ngẫu nhiên từ DB)
// @route   GET /api/workouts/training-of-day
// @access  Private
export const getTrainingOfDay = asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.query;
  const filter: any = {};
  if (level) {
    filter.level = level;
  }

  // Ưu tiên lấy những bài tập mới được thêm vào (mới nhất) theo level
  const recentWorkouts = await Workout.find(filter).sort({ createdAt: -1 }).limit(10);
  
  if (recentWorkouts.length === 0) {
    return sendError(res, 'Không có bài tập nào', 404);
  }

  // Tạo một seed dựa trên ngày hiện tại (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i);
  }

  // Chọn bài tập dựa trên seed để mỗi ngày đổi 1 bài trong top 10 bài mới nhất
  const index = seed % recentWorkouts.length;
  const trainingOfDay = recentWorkouts[index];

  sendSuccess(res, trainingOfDay, 'Lấy Training of the day thành công');
});

// @desc    Lấy chi tiết 1 Khoá tập
// @route   GET /api/workouts/:id
// @access  Private
export const getWorkoutById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const workout = await Workout.findById(id);
  if (!workout) {
    return sendError(res, 'Không tìm thấy bài tập', 404);
  }

  sendSuccess(res, workout, 'Lấy chi tiết bài tập thành công');
});

// @desc    API ẩn để tạo dữ liệu giả (Seed Data) test UI
// @route   POST /api/workouts/seed
// @access  Private
// @desc    Tạo bài tập mới
// @route   POST /api/workouts
// @access  Private (Admin)
export const createWorkout = asyncHandler(async (req: Request, res: Response) => {
  const workoutData = req.body;
  const newWorkout = new Workout(workoutData);
  await newWorkout.save();
  sendSuccess(res, newWorkout, 'Tạo bài tập mới thành công', 201);
});

// @desc    Gợi ý bài tập dựa trên lượt yêu thích (Recommendations)
// @route   GET /api/workouts/recommendations
// @access  Private
export const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 0; // 0 = all

  // Đếm số lần favorite cho mỗi workoutId
  const favCounts = await Favorite.aggregate([
    { $group: { _id: '$workoutId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Lấy tất cả workouts
  const allWorkouts = await Workout.find();

  // Map favCount vào từng workout
  const countMap = new Map(favCounts.map(f => [f._id.toString(), f.count]));
  
  const sorted = allWorkouts
    .map(w => ({ workout: w, favCount: countMap.get(w._id.toString()) || 0 }))
    .sort((a, b) => b.favCount - a.favCount);

  const result = limit > 0 ? sorted.slice(0, limit) : sorted;
  const workouts = result.map(r => ({ ...r.workout.toObject(), favoritesCount: r.favCount }));

  sendSuccess(res, workouts, 'Lấy danh sách recommendations thành công');
});
