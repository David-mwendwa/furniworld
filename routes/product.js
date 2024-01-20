import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/product.js';

const router = Router();

router.route('/').post(createProduct).get(getProducts);
router.route('/:id').get(getProduct).patch(updateProduct).delete(deleteProduct);

export default router;
