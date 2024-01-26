import { Router } from 'express';
import {
  getProfile,
  login,
  logout,
  register,
  updateProfile,
} from '../controllers/user.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.route('/user/register').post(register);
router.route('/user/login').post(login);
router.route('/user/logout').get(logout);

router.route('/user/my-profile').get(protect, getProfile);
router.route('/user/update-profile').patch(protect, updateProfile);

export default router;
