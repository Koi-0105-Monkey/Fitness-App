import express from 'express';
import * as resourceController from '../controllers/resource.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

// Mở public để Admin web dump data
router.post('/', resourceController.createResource);
router.delete('/:id', resourceController.deleteResource);

// Đọc yêu cầu đăng nhập
router.use(verifyToken);
router.get('/', resourceController.getResources);
router.get('/:id', resourceController.getResourceById);

export default router;
