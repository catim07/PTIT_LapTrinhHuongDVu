import { Router } from 'express';
import { auth, admin, requirePermission } from '../middlewares/auth.js';
import * as c from '../controllers/userController.js';

const router = Router();
router.get('/', auth, admin, c.list);
router.post('/staff', auth, admin, requirePermission('settings.write'), c.createStaff);
router.get('/me', auth, c.me);
router.put('/me', auth, c.updateMe);
router.get('/:id', auth, c.detail);
router.put('/:id', auth, c.update);
router.put('/:id/toggle-status', auth, admin, c.toggleStatus);
router.post('/:id/reset-password', auth, admin, c.resetPassword);
router.post('/:id/adjust-points', auth, admin, c.adjustPoints);
router.put('/:id/membership', auth, admin, c.updateMembership);
router.put('/:id/role', auth, admin, c.updateRole);
router.put('/:id/settings', auth, c.updateSettings);
router.delete('/:id', auth, admin, c.remove);
export default router;
