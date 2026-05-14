import { Router } from 'express';
import { auth, admin, requireSuperAdmin } from '../middlewares/auth.js';
import * as c from '../controllers/permissionController.js';

const router = Router();

router.get('/', auth, admin, requireSuperAdmin, c.list);

export default router;
