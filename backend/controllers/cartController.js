import Cart from '../models/Cart.js';
import BranchProduct from '../models/BranchProduct.js';
import Product from '../models/Product.js';

// Helper to populate branchProduct and product info dynamically
const populateCartItems = async (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) return cart;
  
  const populatedItems = await Promise.all(cart.items.map(async (item) => {
    const itemObj = item.toObject ? item.toObject() : { ...item };
    
    // Fetch BranchProduct
    let branchProduct = null;
    try {
      if (item.branch_product_id) {
        branchProduct = await BranchProduct.findById(item.branch_product_id);
      }
    } catch(e) {}
    
    if (branchProduct) {
      const bpObj = branchProduct.toObject ? branchProduct.toObject() : { ...branchProduct };
      bpObj.id = branchProduct._id;
      
      // Fetch Product
      try {
        if (bpObj.product_id) {
          const product = await Product.findById(bpObj.product_id);
          if (product) {
            const pObj = product.toObject ? product.toObject() : { ...product };
            pObj.id = product._id;
            bpObj.product = pObj;
          }
        }
      } catch(e) {}
      
      itemObj.branchProduct = bpObj;
    }
    return itemObj;
  }));
  
  const cartObj = cart.toObject ? cart.toObject() : { ...cart };
  cartObj.items = populatedItems;
  return cartObj;
};

// GET /api/cart?branch_id=xxx  (auth required, user from JWT)
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const branchId = req.query.branch_id;

    if (!branchId) {
      return res.status(400).json({ success: false, message: 'branch_id is required' });
    }

    let cart = await Cart.findOne({ user_id: userId, branch_id: branchId });
    if (!cart) {
      cart = { user_id: userId, branch_id: branchId, items: [] };
    }
    const populatedCart = await populateCartItems(cart);
    return res.json({ success: true, data: populatedCart });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/cart/all-branches  (get carts for all branches for current user)
export const getAllBranchCarts = async (req, res) => {
  try {
    const userId = req.userId;
    const carts = await Cart.find({ user_id: userId });
    // Return as a map: { branchId: items[] }
    const result = {};
    for (const cart of carts) {
      const populated = await populateCartItems(cart);
      result[cart.branch_id] = populated.items || [];
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/cart/items  (add item to cart for a specific branch)
export const addItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { branch_id, branch_product_id, quantity = 1, price = 0, unit_price, product_name, product_image } = req.body;

    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required' });
    }
    if (!branch_product_id) {
      return res.status(400).json({ success: false, message: 'branch_product_id is required' });
    }

    // Detect cross-branch conflict
    const otherCart = await Cart.findOne({ user_id: userId, branch_id: { $ne: branch_id }, items: { $not: { $size: 0 } } });
    if (otherCart && req.body.clear_other_carts !== true) {
      return res.status(409).json({
        success: false,
        code: 'CROSS_BRANCH_CONFLICT',
        message: 'Bạn đang có sản phẩm ở giỏ hàng thuộc chi nhánh khác. Bạn có muốn xóa giỏ hàng cũ để tiếp tục không?',
        data: { other_branch_id: otherCart.branch_id }
      });
    }

    if (req.body.clear_other_carts === true) {
      await Cart.updateMany({ user_id: userId, branch_id: { $ne: branch_id } }, { $set: { items: [] } });
    }

    let cart = await Cart.findOne({ user_id: userId, branch_id });
    if (!cart) {
      cart = new Cart({ user_id: userId, branch_id, items: [] });
    }

    const existing = cart.items.find(i => String(i.branch_product_id) === String(branch_product_id));
    if (existing) {
      existing.quantity += quantity;
      existing.price = price || existing.price;
      existing.unit_price = unit_price || price || existing.unit_price;
      if (product_name) existing.product_name = product_name;
      if (product_image) existing.product_image = product_image;
    } else {
      cart.items.push({
        branch_product_id,
        quantity,
        price,
        unit_price: unit_price || price,
        product_name: product_name || '',
        product_image: product_image || '',
      });
    }
    await cart.save();
    
    // Populate before returning so frontend gets full info right away
    const populatedCart = await populateCartItems(cart);
    return res.json({ success: true, data: populatedCart, message: 'Đã thêm vào giỏ hàng' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/cart/items/:branchProductId
export const updateItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { branch_id, quantity } = req.body;
    const branchProductId = req.params.id;

    if (!branch_id) {
      return res.status(400).json({ success: false, message: 'branch_id is required' });
    }

    const cart = await Cart.findOne({ user_id: userId, branch_id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find(i => String(i.branch_product_id) === String(branchProductId));
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    item.quantity = quantity;
    await cart.save();
    
    const populatedCart = await populateCartItems(cart);
    return res.json({ success: true, data: populatedCart });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart/items/:branchProductId?branch_id=xxx
export const removeItem = async (req, res) => {
  try {
    const userId = req.userId;
    const branchProductId = req.params.id;
    const branchId = req.query.branch_id || req.body?.branch_id;

    if (!branchId) {
      return res.status(400).json({ success: false, message: 'branch_id is required' });
    }

    const cart = await Cart.findOne({ user_id: userId, branch_id: branchId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(
      i => String(i.branch_product_id) !== String(branchProductId) && String(i._id) !== String(branchProductId)
    );
    await cart.save();
    
    const populatedCart = await populateCartItems(cart);
    return res.json({ success: true, data: populatedCart, message: 'Đã xóa khỏi giỏ hàng' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { branch_id } = req.body;

    if (branch_id) {
      // Clear specific branch cart
      await Cart.findOneAndUpdate({ user_id: userId, branch_id }, { items: [] });
      return res.json({ success: true, message: `Đã xóa giỏ hàng chi nhánh ${branch_id}` });
    } else {
      // Clear all carts for user
      await Cart.updateMany({ user_id: userId }, { items: [] });
      return res.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
