import { Router } from 'express';
import { auth, admin, requirePermission } from '../middlewares/auth.js';
import * as c from '../controllers/stockMovementController.js';

const router = Router();

router.get('/', auth, admin, requirePermission('inventory.read'), c.list);
router.get('/summary', auth, admin, requirePermission('inventory.read'), c.summary);
router.get('/:id', auth, admin, requirePermission('inventory.read'), c.detail);

export default router;
