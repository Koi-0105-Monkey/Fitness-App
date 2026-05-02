import express from 'express';
import * as resourceController from '../controllers/resource.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// Mở public để Admin web thao tác dữ liệu
router.get('/', resourceController.getResources);
router.get('/:id', resourceController.getResourceById);
router.post('/', resourceController.createResource);
router.put('/:id', resourceController.updateResource);
router.delete('/:id', resourceController.deleteResource);

// Các yêu cầu khác (nếu có) mới cần đăng nhập
router.use(verifyToken);

export default router;
