import { Router } from 'express';
import {
  deleteProfile,
  getProfile,
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  updateProfile,
} from '../controllers/user.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.route('/user/register').post(register);
router.route('/user/login').post(login);
router.route('/user/logout').get(logout);

router.route('/user/my-profile').get(protect, getProfile);
router.route('/user/profile-update').patch(protect, updateProfile);
router.route('/user/profile-delete').patch(protect, deleteProfile);
router.route('/user/password-update').patch(protect, updatePassword);

router.route('/user/password-forgot').post(requestPasswordReset);
router.route('/user/password-reset/:token').patch(resetPassword);

export default router;
