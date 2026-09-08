import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import normalizeUploads from '../middleware/normalizeUploads.js';
import { attachImages } from '../controllers/productController.js';

const router = Router();

router.post(
  '/products',
  protect,
  restrictTo('admin'),
  upload.array('images', 8),
  // Between multer and the controller: the files are already on disk here,
  // and the controller records the paths, so this is the only point where
  // they can be resized without either being too early or too late.
  normalizeUploads,
  attachImages
);

export default router;
