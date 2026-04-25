import express from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Cấu hình multer lưu file vào bộ nhớ (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Giới hạn 50MB cho Video
});

router.post('/', upload.single('file'), asyncHandler(async (req: any, res: any) => {
  if (!req.file) {
    return sendError(res, 'Vui lòng chọn file để upload', 400);
  }

  try {
    const result: any = await uploadToCloudinary(req.file);
    sendSuccess(res, { 
      url: result.secure_url,
      duration: result.duration // Trả về thời lượng video (giây)
    }, 'Upload thành công');
  } catch (error) {
    console.log('Cloudinary Upload Error:', error);
    sendError(res, 'Lỗi khi upload lên Cloudinary', 500);
  }
}));

export default router;
