import { Router } from 'express';
import { auth, admin } from '../middlewares/auth.js';
import * as c from '../controllers/supportController.js';

const router = Router();
router.get('/tickets/stats', auth, admin, c.stats);
router.get('/tickets', auth, c.list);
router.post('/tickets', auth, c.create);
router.get('/tickets/:id', auth, c.detail);
router.get('/tickets/:id/messages', auth, c.messages);
router.post('/tickets/:id/messages', auth, c.sendMessage);
router.post('/tickets/:id/reply', auth, admin, c.sendMessage);
router.put('/tickets/:id/status', auth, admin, c.updateStatus);
router.put('/tickets/:id/assign', auth, admin, c.assignAgent);
router.post('/tickets/:id/internal-note', auth, admin, c.internalNote);
export default router;
