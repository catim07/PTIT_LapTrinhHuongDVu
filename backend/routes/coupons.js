import { Router } from 'express';
import { auth, admin, optionalAuth } from '../middlewares/auth.js';
import * as c from '../controllers/couponController.js';

const router = Router();

// Public / User routes
router.get('/', optionalAuth, c.list);
router.get('/usage', auth, c.usage);
router.get('/my-wallet', auth, c.myWallet);
router.post('/validate', optionalAuth, c.validate);
router.post('/apply', optionalAuth, c.apply);
router.post('/remove', optionalAuth, c.remove);
router.post('/:id/claim', auth, c.claimCoupon);
router.get('/:code', c.detail);

// Admin routes
router.post('/', auth, admin, c.create);
router.put('/:id', auth, admin, c.update);
router.delete('/:id', auth, admin, c.removeCoupon);

export default router;
