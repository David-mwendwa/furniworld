import { Router } from 'express';
import {
  deleteProfile,
  getProfile,
  login,
  logout,
  register,
  updatePassword,
  updateProfile,
} from '../controllers/user.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.route('/user/register').post(register);
router.route('/user/login').post(login);
router.route('/user/logout').get(logout);

router.route('/user/my-profile').get(protect, getProfile);
router.route('/user/update-profile').patch(protect, updateProfile);
router.route('/user/update-password').patch(protect, updatePassword);
router.route('/user/delete-profile').patch(protect, deleteProfile);

export default router;
