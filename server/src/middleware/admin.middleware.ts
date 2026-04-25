import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Middleware kiểm tra quyền Admin.
 * Phải được dùng sau verifyToken middleware.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 'Quyền truy cập bị từ chối. Bạn không phải là Admin.', 403);
  }
};
