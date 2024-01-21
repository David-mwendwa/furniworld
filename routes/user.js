import { Router } from 'express';
import { login, logout, register } from '../controllers/user.js';

const router = Router();

router.route('/user/register').post(register);
router.route('/user/login').post(login);
router.route('/user/logout').get(logout);

export default router;
