import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getMyReviews,
  updateMyReview,
  deleteMyReview,
  listReviews,
  setReviewStatus,
} from '../controllers/reviewController.js';

const router = Router();

router.use(protect);

router.get('/my', getMyReviews);
router.patch('/:id', updateMyReview);
router.delete('/:id', deleteMyReview);

router.get('/', restrictTo('admin'), listReviews);
router.patch('/:id/status', restrictTo('admin'), setReviewStatus);

export default router;
