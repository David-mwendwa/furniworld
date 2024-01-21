import { Router } from 'express';
import { login, register } from '../controllers/user.js';

const router = Router();

router.route('/user/register').post(register);
router.route('/user/login').post(login);

export default router;
