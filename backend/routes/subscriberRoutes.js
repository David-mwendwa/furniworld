import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { subscribe } from '../controllers/subscriberController.js';

const router = Router();

router.post('/', optionalAuth, subscribe);

export default router;
