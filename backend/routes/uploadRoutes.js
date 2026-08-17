import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { attachImages } from '../controllers/productController.js';

const router = Router();

router.post(
  '/products',
  protect,
  restrictTo('admin'),
  upload.array('images', 8),
  attachImages
);

export default router;
