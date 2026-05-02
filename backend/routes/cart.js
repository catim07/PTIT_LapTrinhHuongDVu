import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import * as c from '../controllers/cartController.js';

const router = Router();

// All cart routes require authentication
router.get('/', auth, c.getCart);                    // GET /api/cart?branch_id=xxx
router.get('/all-branches', auth, c.getAllBranchCarts); // GET /api/cart/all-branches
router.post('/items', auth, c.addItem);              // POST /api/cart/items
router.put('/items/:id', auth, c.updateItem);        // PUT /api/cart/items/:branchProductId
router.delete('/items/:id', auth, c.removeItem);     // DELETE /api/cart/items/:branchProductId?branch_id=xxx
router.post('/clear', auth, c.clearCart);            // POST /api/cart/clear

export default router;
