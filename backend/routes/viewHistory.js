import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import * as c from '../controllers/viewHistoryController.js';

const router = Router();

router.get('/', auth, c.list);
router.post('/', auth, c.track);
router.post('/merge', auth, c.merge);
router.delete('/', auth, c.clear);
router.delete('/clear', auth, c.clear);
router.delete('/:id', auth, c.remove);

export default router;
