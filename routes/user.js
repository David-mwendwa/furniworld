import { Router } from 'express';
import { register } from '../controllers/user.js';

const router = Router();

router.route('/user/register').post(register);

export default router;
