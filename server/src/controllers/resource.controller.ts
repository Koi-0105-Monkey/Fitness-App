import { Request, Response } from 'express';
import Resource from '../models/Resource.model';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// @desc  Lấy danh sách resources (lọc theo type, muscleGroup, equipment, sport)
// @route GET /api/resources
// @access Private
export const getResources = asyncHandler(async (req: Request, res: Response) => {
  const { type, muscleGroup, equipment, sport } = req.query;
  const filter: any = {};

  if (type)        filter.type = type;
  if (muscleGroup) filter.muscleGroups = muscleGroup;
  if (equipment)   filter.equipment = equipment;
  if (sport)       filter.sport = sport;

  const resources = await Resource.find(filter).sort({ favoritesCount: -1, viewsCount: -1 });
  sendSuccess(res, resources, 'Lấy danh sách resources thành công');
});

// @desc  Lấy chi tiết 1 resource
// @route GET /api/resources/:id
// @access Private
export const getResourceById = asyncHandler(async (req: Request, res: Response) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewsCount: 1 } }, // tăng view mỗi lần xem
    { new: true }
  );
  if (!resource) return sendError(res, 'Không tìm thấy resource', 404);
  sendSuccess(res, resource, 'Lấy resource thành công');
});

// @desc  Tạo resource mới (Admin only — dùng từ Admin Web)
// @route POST /api/resources
// @access Public (mở để Admin dump data dễ dàng)
export const createResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = new Resource(req.body);
  await resource.save();
  sendSuccess(res, resource, 'Tạo resource thành công', 201);
});

// @desc  Xoá resource
// @route DELETE /api/resources/:id
// @access Public (mở để Admin dễ xoá)
export const deleteResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await Resource.findByIdAndDelete(req.params.id);
  if (!resource) return sendError(res, 'Không tìm thấy resource', 404);
  sendSuccess(res, null, 'Đã xoá resource thành công');
});

// @desc  Cập nhật resource
// @route PUT /api/resources/:id
// @access Public (mở để Admin dễ sửa)
export const updateResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!resource) return sendError(res, 'Không tìm thấy resource', 404);
  sendSuccess(res, resource, 'Cập nhật resource thành công');
});
