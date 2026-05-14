import { Router } from 'express';
import { auth, admin, requireSuperAdmin } from '../middlewares/auth.js';
import * as c from '../controllers/roleController.js';

const router = Router();

// All role management endpoints require super_admin
router.get('/', auth, admin, requireSuperAdmin, c.list);
router.get('/me', auth, admin, c.forCurrentUser); // own role — any admin
router.get('/:id', auth, admin, requireSuperAdmin, c.detail);
router.post('/', auth, admin, requireSuperAdmin, c.create);
router.put('/:id', auth, admin, requireSuperAdmin, c.update);
router.patch('/assign', auth, admin, requireSuperAdmin, c.updateUserRole);

export default router;
