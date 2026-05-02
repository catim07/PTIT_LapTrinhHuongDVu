import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import * as c from '../controllers/wishlistController.js';

const router = Router();

router.get('/', auth, c.list);
router.post('/', auth, c.add);
router.post('/toggle', auth, c.toggle);
router.delete('/clear', auth, c.clear);
router.delete('/:id', auth, c.remove);

export default router;
