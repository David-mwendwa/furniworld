import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import mpesaAuth from '../middleware/mpesaAuth.js';
import {
  processCardPayment,
  processMpesaPayment,
  mpesaCallback,
  checkPaymentStatus,
  getPaymentConfig,
} from '../controllers/paymentController.js';
import {
  listPaymentsForReview,
  reviewPayment,
} from '../controllers/paymentReviewController.js';

const router = Router();

// Safaricom posts here server-to-server, so it carries no session of ours.
router.post('/mpesa/callback', mpesaCallback);

router.get('/config', getPaymentConfig);

router.use(protect);

router.post('/card', processCardPayment);
router.post('/mpesa', mpesaAuth, processMpesaPayment);
router.get('/status/:orderNumber', checkPaymentStatus);

router.get('/review', restrictTo('admin'), listPaymentsForReview);
router.patch('/review/:id', restrictTo('admin'), reviewPayment);

export default router;
