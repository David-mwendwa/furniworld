import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  validateCart,
  getCart,
  setCart,
  mergeCart,
  addItem,
  removeItem,
  clearCart,
} from '../controllers/cartController.js';

const router = Router();

// Open to guests: prices the items a browser is holding in localStorage.
router.post('/validate', validateCart);

router.use(protect);
router.get('/', getCart);
router.put('/', setCart);
router.post('/merge', mergeCart);
router.post('/items', addItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

export default router;
