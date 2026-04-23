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
