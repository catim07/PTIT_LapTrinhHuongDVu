import { Router } from 'express';
import { auth, admin } from '../middlewares/auth.js';
import * as c from '../controllers/orderController.js';

const router = Router();
router.post('/', auth, c.create);
router.post('/create-from-cart', auth, c.createFromCart);
router.get('/', auth, c.list);
router.get('/:id', auth, c.detail);
router.put('/:id/cancel', auth, c.cancel);
router.get('/:id/tracking', auth, c.tracking);
router.put('/:id/status', auth, admin, c.updateStatus);
router.put('/:id/tracking-number', auth, admin, c.assignTracking);
router.post('/:id/refund', auth, admin, c.refund);
router.post('/:id/reorder', auth, c.reorder);
router.get('/:id/invoice', auth, c.getInvoice);
export default router;
