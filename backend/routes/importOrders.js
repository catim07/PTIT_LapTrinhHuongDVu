import { Router } from 'express';
import { auth, admin, requirePermission } from '../middlewares/auth.js';
import * as c from '../controllers/importOrderController.js';

const router = Router();

router.get('/', auth, admin, requirePermission('imports.read'), c.list);
router.get('/:id', auth, admin, requirePermission('imports.read'), c.detail);
router.post('/', auth, admin, requirePermission('imports.write'), c.create);
router.put('/:id', auth, admin, requirePermission('imports.write'), c.update);
router.patch('/:id/status', auth, admin, requirePermission('imports.write'), c.updateStatus);

export default router;
