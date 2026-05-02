import { Router } from 'express';
import { auth, admin, requirePermission } from '../middlewares/auth.js';
import * as c from '../controllers/roleController.js';

const router = Router();

router.get('/', auth, admin, requirePermission('settings.read'), c.list);
router.get('/me', auth, admin, c.forCurrentUser);
router.get('/:id', auth, admin, requirePermission('settings.read'), c.detail);
router.post('/', auth, admin, requirePermission('settings.write'), c.create);
router.put('/:id', auth, admin, requirePermission('settings.write'), c.update);
router.patch('/assign', auth, admin, requirePermission('settings.write'), c.updateUserRole);

export default router;
