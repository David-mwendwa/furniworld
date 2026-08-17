import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { submitPaymentReference } from '../controllers/paymentReviewController.js';
import {
  quoteOrder,
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  getTransitions,
} from '../controllers/orderController.js';

const router = Router();

router.use(protect);

// Placing and owning orders is a shopper action — an admin account exists to
// run the store, not to buy from it, so these stay off-limits to that role
// rather than just being hidden in the UI.
router.post('/quote', restrictTo('user'), quoteOrder);
router.post('/', restrictTo('user'), createOrder);
router.get('/my', restrictTo('user'), getMyOrders);
router.get('/my/:orderNumber', restrictTo('user'), getMyOrder);
router.patch('/my/:orderNumber/cancel', restrictTo('user'), cancelMyOrder);
router.post('/my/:orderNumber/payment/reference', restrictTo('user'), submitPaymentReference);

router.get('/transitions', restrictTo('admin'), getTransitions);
router.get('/', restrictTo('admin'), listOrders);
router.get('/:id', restrictTo('admin'), getOrder);
router.patch('/:id/status', restrictTo('admin'), updateOrderStatus);

export default router;
