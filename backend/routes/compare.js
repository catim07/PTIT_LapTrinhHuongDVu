import { Router } from 'express';
import * as c from '../controllers/compareController.js';

const router = Router();

router.get('/summary/status', c.summaryStatus);
router.post('/summary', c.summary);

export default router;
