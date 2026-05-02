import { Router } from 'express';
import * as c from '../controllers/categoryController.js';
import { auth, admin } from '../middlewares/auth.js';

const router = Router();
router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/', auth, admin, c.create);
router.put('/:id', auth, admin, c.update);
router.delete('/:id', auth, admin, c.remove);
export default router;
