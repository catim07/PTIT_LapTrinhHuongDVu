import { Router } from 'express';
import { auth, admin, requirePermission } from '../middlewares/auth.js';
import * as c from '../controllers/auditLogController.js';

const router = Router();

router.get('/', auth, admin, requirePermission('audit.read'), c.list);
router.get('/:id', auth, admin, requirePermission('audit.read'), c.detail);

export default router;
