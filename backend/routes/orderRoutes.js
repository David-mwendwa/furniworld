import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
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

router.post('/quote', quoteOrder);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/my/:orderNumber', getMyOrder);
router.patch('/my/:orderNumber/cancel', cancelMyOrder);

router.get('/transitions', restrictTo('admin'), getTransitions);
router.get('/', restrictTo('admin'), listOrders);
router.get('/:id', restrictTo('admin'), getOrder);
router.patch('/:id/status', restrictTo('admin'), updateOrderStatus);

export default router;
