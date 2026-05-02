import { Router } from 'express';
import { auth, admin } from '../middlewares/auth.js';
import * as c from '../controllers/returnRequestController.js';

const router = Router();

router.get('/', auth, c.list);
router.get('/:id', auth, c.detail);
router.post('/', auth, c.create);
router.put('/:id/cancel', auth, c.cancel);
router.put('/:id/status', auth, admin, c.updateStatus);

export default router;
