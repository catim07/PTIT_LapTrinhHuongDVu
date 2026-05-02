import { Router } from 'express';
import { auth, admin, optionalAuth } from '../middlewares/auth.js';
import * as c from '../controllers/bannerController.js';

const router = Router();
// Banners
router.get('/', optionalAuth, c.listBanners);
router.get('/home', c.homeBanners);
router.get('/promo', c.promoBanners);
router.post('/', auth, admin, c.createBanner);
router.put('/:id', auth, admin, c.updateBanner);
router.delete('/:id', auth, admin, c.deleteBanner);
export default router;
