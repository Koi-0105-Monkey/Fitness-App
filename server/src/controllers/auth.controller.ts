import { Request, Response } from 'express';
import User from '../models/User.model';
import { sendSuccess, sendCreated, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { generateTokens } from '../utils/jwt';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'Email is already in use', 400);
  }

  const user = await User.create({ fullName, email, password });
  const tokens = generateTokens(user.id, user.email);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  // Loại bỏ password và refreshToken trước khi trả về
  const userResponse: any = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  sendCreated(res, { user: userResponse, tokens }, 'User registered successfully');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Mặc định select: false ở password bên schema, nên phải .select('+password') lấy ra để compare
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 'Invalid email or password', 401);
  }

  const tokens = generateTokens(user.id, user.email);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  const userResponse: any = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  sendSuccess(res, { user: userResponse, tokens }, 'Login successful');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, 'Refresh token is required', 400);
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    return sendError(res, 'Invalid refresh token', 401);
  }

  // Cấp bộ token mới
  const tokens = generateTokens(user.id, user.email);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  sendSuccess(res, { tokens }, 'Token refreshed successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    // Để bảo mật, không cho biết email có tồn tại không
    return sendSuccess(res, null, 'If this email exists, a password reset link has been sent');
  }

  // TODO: Tích hợp thư viện Email gửi link/OTP thật (hiện tại mock success)
  sendSuccess(res, null, 'If this email exists, a password reset link has been sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, newPassword, otp } = req.body; 
  const user = await User.findOne({ email });
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // TODO: Kiểm tra xem OTP từ email có khớp không (Mock: pass luôn)
  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, 'Password has been reset successfully');
});
