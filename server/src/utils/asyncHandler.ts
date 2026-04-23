import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper để tránh try/catch lặp đi lặp lại trong mỗi controller.
 * Dùng: asyncHandler(async (req, res) => { ... })
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
