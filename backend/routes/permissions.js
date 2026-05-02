import { Router } from 'express';
import { auth, admin, requirePermission } from '../middlewares/auth.js';
import * as c from '../controllers/permissionController.js';

const router = Router();

router.get('/', auth, admin, requirePermission('settings.read'), c.list);

export default router;
