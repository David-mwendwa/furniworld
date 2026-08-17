import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  updateMe,
  deleteMe,
  listUsers,
  getUser,
  updateUserRole,
  deactivateUser,
} from '../controllers/userController.js';

const router = Router();

router.use(protect);

router.patch('/me', updateMe);
router.delete('/me', deleteMe);

router.use(restrictTo('admin'));
router.get('/', listUsers);
router.get('/:id', getUser);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deactivateUser);

export default router;
