import { Response } from 'express';

type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ErrorResponse = {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) => {
  const response: SuccessResponse<T> = { success: true, message, data };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
  message = 'Success'
) => {
  const response: SuccessResponse<T[]> = {
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };
  return res.status(200).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: { field: string; message: string }[]
) => {
  const response: ErrorResponse = { success: false, message, errors };
  return res.status(statusCode).json(response);
};
