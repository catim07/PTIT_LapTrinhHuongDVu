import { Router } from 'express';
import { auth, admin } from '../middlewares/auth.js';
import * as c from '../controllers/notificationController.js';

const router = Router();
router.get('/', auth, c.list);
router.get('/unread-count', auth, c.unreadCount);
router.post('/broadcast', auth, admin, c.broadcast);
router.put('/read-all', auth, c.markAllRead);
router.put('/:id/read', auth, c.markRead);
router.delete('/:id', auth, c.remove);
export default router;

