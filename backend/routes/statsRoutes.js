import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/statsController.js';

const router = Router();

router.get('/dashboard', protect, restrictTo('admin'), getDashboardStats);

export default router;
