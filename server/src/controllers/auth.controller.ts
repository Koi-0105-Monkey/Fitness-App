import { Request, Response } from 'express';
import User from '../models/User.model';
import { sendSuccess, sendCreated, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { generateTokens } from '../utils/jwt';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, emailOrPhone, password } = req.body;

  // Kiểm tra emailOrPhone là email hay sdt
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
  const query = isEmail ? { email: emailOrPhone } : { mobileNumber: emailOrPhone };

  const existingUser = await User.findOne(query);
  if (existingUser) {
    return sendError(res, `${isEmail ? 'Email' : 'Số điện thoại'} đã được sử dụng`, 400);
  }

  const userData: any = { fullName, password, authProvider: 'local' };
  if (isEmail) userData.email = emailOrPhone;
  else userData.mobileNumber = emailOrPhone;

  const user = await User.create(userData);
  const tokens = generateTokens(user.id, user.email || user.mobileNumber || '');
  user.refreshToken = tokens.refreshToken;
  await user.save();

  const userResponse: any = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  sendCreated(res, { user: userResponse, tokens }, 'User registered successfully');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrPhone, password } = req.body;
  
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { mobileNumber: emailOrPhone }]
  }).select('+password');
  
  if (!user || user.authProvider !== 'local' || !(await user.comparePassword(password))) {
    return sendError(res, 'Sai tài khoản hoặc mật khẩu (hoặc tài khoản liên kết MXH)', 401);
  }

  const tokens = generateTokens(user.id, user.email || user.mobileNumber || '');
  user.refreshToken = tokens.refreshToken;
  await user.save();

  const userResponse: any = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  sendSuccess(res, { user: userResponse, tokens }, 'Login successful');
});

export const socialLogin = asyncHandler(async (req: Request, res: Response) => {
  const { provider, providerId, email, fullName, avatarUrl } = req.body;
  // Trong thực tế: Backend phải verify Google/Facebook AccessToken gửi từ FE
  // FE gửi token -> BE tự fetch thông tin từ Google/Facebook API bằng token đó.
  // Ở code này tạm thời skip bước verify token để đơn giản hoá ở FE 

  let user = await User.findOne({ 
    $or: [
      { providerId, authProvider: provider },
      { email } // Gộp tài khoản nếu email trùng khớp
    ]
  });

  if (!user) {
    user = await User.create({
      authProvider: provider,
      providerId,
      email,
      fullName,
      avatarUrl,
      isSetupComplete: false
    });
  } else if (!user.providerId) {
    // Nếu email trùng nhưng tài khoản cũ chưa liên kết social
    user.providerId = providerId;
    user.authProvider = provider;
  }

  const tokens = generateTokens(user.id, user.email || '');
  user.refreshToken = tokens.refreshToken;
  await user.save();

  const userResponse: any = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  sendSuccess(res, { user: userResponse, tokens }, 'Social login successful');
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
  const tokens = generateTokens(user.id, user.email || user.mobileNumber || '');
  user.refreshToken = tokens.refreshToken;
  await user.save();

  sendSuccess(res, { tokens }, 'Token refreshed successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrPhone } = req.body;
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { mobileNumber: emailOrPhone }]
  });
  
  if (!user) {
    return sendSuccess(res, null, 'If this account exists, a reset code has been sent');
  }

  // TODO: Tích hợp thư viện gửi Email/SMS OTP
  sendSuccess(res, null, 'If this account exists, a reset code has been sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrPhone, newPassword, otp } = req.body; 
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { mobileNumber: emailOrPhone }]
  });
  
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // TODO: Kiểm tra xem OTP từ email có khớp không (Mock: pass luôn)
  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, 'Password has been reset successfully');
});
