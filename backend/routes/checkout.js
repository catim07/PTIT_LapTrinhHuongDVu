import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.js';
import * as c from '../controllers/checkoutController.js';

const router = Router();

router.post('/calculate', optionalAuth, c.calculate);
router.post('/preview', optionalAuth, c.preview);

export default router;
