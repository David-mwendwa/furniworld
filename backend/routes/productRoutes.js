import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getProducts,
  getProduct,
  getFeatured,
  getFacets,
  listAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import {
  getProductReviews,
  createReview,
} from '../controllers/reviewController.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/facets', getFacets);

// Registered before /:slug so "admin" is not read as a product slug.
router.get('/admin/all', protect, restrictTo('admin'), listAllProducts);
router.get('/admin/:id', protect, restrictTo('admin'), getProductById);
router.post('/', protect, restrictTo('admin'), createProduct);
router.patch('/:id', protect, restrictTo('admin'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

router.get('/:slug', getProduct);
router.get('/:slug/reviews', getProductReviews);
router.post('/:productId/reviews', protect, createReview);

export default router;
