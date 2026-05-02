import { Router } from 'express';
import { auth, admin, requirePermission } from '../middlewares/auth.js';
import * as c from '../controllers/supplierController.js';

const router = Router();

router.get('/', auth, admin, requirePermission('suppliers.read'), c.list);
router.get('/:id', auth, admin, requirePermission('suppliers.read'), c.detail);
router.post('/', auth, admin, requirePermission('suppliers.write'), c.create);
router.put('/:id', auth, admin, requirePermission('suppliers.write'), c.update);
router.delete('/:id', auth, admin, requirePermission('suppliers.write'), c.remove);

export default router;
