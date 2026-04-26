import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Favorite from '../models/Favorite.model';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Lấy danh sách favorites của user hiện tại
// @route   GET /api/favorites
// @access  Private
export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const favorites = await Favorite.find({ userId })
    .populate('workoutId') // Lấy đầy đủ thông tin Workout
    .sort({ addedAt: -1 }); // Mới nhất trước

  // Map sang format gọn hơn và lọc bài tập bị xoá (null)
  const result = favorites
    .filter(fav => fav.workoutId !== null)
    .map(fav => ({
      addedAt: fav.addedAt,
      workout: fav.workoutId,
    }));

  sendSuccess(res, result, 'Lấy danh sách yêu thích thành công');
});

// @desc    Toggle favorite (thêm nếu chưa có, xoá nếu đã có)
// @route   POST /api/favorites/toggle
// @access  Private
export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { workoutId } = req.body;

  console.log(`[DEBUG] Toggle Favorite - User: ${userId}, Workout: ${workoutId}`);

  if (!workoutId) {
    return sendError(res, 'workoutId là bắt buộc', 400);
  }

  // Kiểm tra workoutId có đúng định dạng MongoDB ObjectId không
  if (!mongoose.Types.ObjectId.isValid(workoutId)) {
    return sendError(res, 'workoutId không đúng định dạng', 400);
  }

  try {
    const existing = await Favorite.findOne({ userId, workoutId });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      console.log(`[DEBUG] Removed favorite for workout: ${workoutId}`);
      return sendSuccess(res, { isFavorite: false }, 'Đã xoá khỏi yêu thích');
    } else {
      await Favorite.create({ userId, workoutId });
      console.log(`[DEBUG] Added favorite for workout: ${workoutId}`);
      return sendSuccess(res, { isFavorite: true }, 'Đã thêm vào yêu thích', 201);
    }
  } catch (error: any) {
    console.error(`[ERROR] Toggle Favorite failed:`, error);
    throw error; // Đẩy lên errorMiddleware
  }
});

// @desc    Kiểm tra một workout có đang được favorite không
// @route   GET /api/favorites/check/:workoutId
// @access  Private
export const checkFavorite = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { workoutId } = req.params;

  const existing = await Favorite.findOne({ userId, workoutId });
  sendSuccess(res, { isFavorite: !!existing }, 'OK');
});
