import { Router } from 'express';
import { auth, admin } from '../middlewares/auth.js';
import * as c from '../controllers/reviewController.js';

const router = Router();
router.get('/stats', auth, admin, c.stats);
router.get('/', auth, c.list);
router.put('/:id/status', auth, admin, c.updateStatus);
router.put('/:id', auth, c.update);
router.delete('/:id', auth, c.remove);
router.post('/:id/reply', auth, admin, c.reply);
export default router;
