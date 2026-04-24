import { Request, Response } from 'express';
import User from '../models/User.model';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // `req.user` có sẵn nhờ middleware `verifyToken`
  const userId = req.user?.userId; 
  const user = await User.findById(userId);
  
  if (!user) {
    return sendError(res, 'User not found', 404);
  }
  
  sendSuccess(res, user, 'User profile retrieved successfully');
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const updates = req.body;

  // Không cho phép update password qua endpoint này
  if (updates.password) delete updates.password;

  // Cho phép FE truyền `isSetupComplete: true` khi xong Setup Wizard
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,           // Trả về object sau khi đã update
    runValidators: true, // Chạy Model Validator của mongoose
  });

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  sendSuccess(res, user, 'Profile updated successfully');
});

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { resourceId } = req.body;

  if (!resourceId) return sendError(res, 'Thiếu ID tài nguyên (Bài tập/Video/Bài báo)', 400);

  const user = await User.findById(userId);
  if (!user) return sendError(res, 'User not found', 404);

  const index = user.favoriteResources.indexOf(resourceId);
  if (index > -1) {
    user.favoriteResources.splice(index, 1); // Đã có thì bỏ thích
  } else {
    user.favoriteResources.push(resourceId); // Chưa có thì thích
  }

  await user.save();
  sendSuccess(res, user.favoriteResources, 'Đã cập nhật danh sách yêu thích');
});

export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  // Lấy danh sách favorite của user, có móc nối thông tin (populate) với bảng tương ứng
  // Vì tuỳ thuộc vào ID thuộc bảng Workout hay Resource, Mongoose (với refPath) sẽ tìm đúng chỗ.
  const user = await User.findById(userId).populate('favoriteResources');
  
  if (!user) return sendError(res, 'User not found', 404);

  sendSuccess(res, user.favoriteResources, 'Danh sách yêu thích');
});

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const user = await User.findByIdAndDelete(userId);
  if (!user) return sendError(res, 'User not found', 404);

  // TODO: Nếu app cần lưu giữ data thì chỉ đổi isDeleted = true thay vì xoá cứng
  
  sendSuccess(res, null, 'Đã xoá tài khoản thành công');
});
