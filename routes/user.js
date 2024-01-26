import { Router } from 'express';
import {
  deleteProfile,
  deleteUser,
  getProfile,
  getUser,
  getUsers,
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUser,
} from '../controllers/user.js';
import { authorizeRoles, protect } from '../middleware/auth.js';

const router = Router();

// user routes
router.route('/user/register').post(register);
router.route('/user/login').post(login);
router.route('/user/logout').get(logout);

router.route('/user/my-profile').get(protect, getProfile);
router.route('/user/profile-update').patch(protect, updateProfile);
router.route('/user/profile-delete').patch(protect, deleteProfile);
router.route('/user/password-update').patch(protect, updatePassword);

router.route('/user/password-forgot').post(requestPasswordReset);
router.route('/user/password-reset/:token').patch(resetPassword);

// admin routes
router.route('/admin/users').get(protect, authorizeRoles('admin'), getUsers);
router
  .route('/admin/users/:id')
  .get(protect, authorizeRoles('admin'), getUser)
  .patch(protect, authorizeRoles('admin'), updateUser)
  .delete(protect, authorizeRoles('admin'), deleteUser);

export default router;
