import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Product from '../models/Product.js';
import Promotion from '../models/Promotion.js';
import { Coupon } from '../models/Coupon.js';
import { Banner, HotDeal } from '../models/Misc.js';
import Category from '../models/Category.js';

// Fallback logic
const DEFAULT_PRODUCT_IMG = 'https://lottemart.vn/media/catalog/product/placeholder/default/20210219_logo_800x800.png';
const DEFAULT_PROMO_BANNER = 'https://lottemart.vn/media/catalog/category/new_category/Bia_Th_t_Nh_p_Kh_u.png';
const DEFAULT_HOTDEAL_IMG = 'https://lottemart.vn/media/catalog/category/new_category/Bia_Th_t_Nh_p_Kh_u.png';

const runBackfill = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB. Starting Backfill for Image + Promos...');

    // 1. Products
    const products = await Product.find({});
    console.log(`Checking ${products.length} products...`);
    for (let p of products) {
      let changed = false;
      if (!p.thumbnail || p.thumbnail.trim() === '') {
        p.thumbnail = (p.images && p.images.length > 0) ? p.images[0] : DEFAULT_PRODUCT_IMG;
        changed = true;
      }
      if (!p.images || p.images.length === 0) {
        p.images = [p.thumbnail];
        changed = true;
      }
      if (changed) await p.save();
    }
    console.log('Products backfill done.');

    // 2. Categories
    const categories = await Category.find({});
    for (let c of categories) {
      let changed = false;
      if (!c.image || c.image.trim() === '') {
        c.image = DEFAULT_PRODUCT_IMG;
        changed = true;
      }
      if (changed) await c.save();
    }

    // 3. Promotions
    const promotions = await Promotion.find({});
    for (let pr of promotions) {
      let changed = false;
      if (!pr.banner_image || pr.banner_image.trim() === '') {
        pr.banner_image = pr.image || DEFAULT_PROMO_BANNER;
        changed = true;
      }
      // Populate remaining_quantity if missing
      if (pr.total_quantity !== null && pr.remaining_quantity === null) {
        pr.remaining_quantity = Math.max(0, pr.total_quantity - (pr.claimed_count || 0));
        changed = true;
      }
      if (changed) await pr.save();
    }

    // 4. Coupons
    const coupons = await Coupon.find({});
    for (let cp of coupons) {
      let changed = false;
      if (!cp.banner_image || cp.banner_image.trim() === '') {
        cp.banner_image = cp.image || DEFAULT_PROMO_BANNER;
        changed = true;
      }
      if (!cp.status) {
        cp.status = cp.is_active ? 'active' : 'draft';
        changed = true;
      }
      if (cp.total_quantity !== null && cp.remaining_quantity === null) {
        cp.remaining_quantity = Math.max(0, cp.total_quantity - (cp.used_count || cp.claimed_count || 0));
        changed = true;
      }
      if (changed) await cp.save();
    }

    // 5. Banners
    const banners = await Banner.find({});
    for (let b of banners) {
      let changed = false;
      if (!b.image_url || b.image_url.trim() === '') {
        b.image_url = b.image || DEFAULT_PROMO_BANNER;
        changed = true;
      }
      if (changed) await b.save();
    }

    // 6. Hot Deals
    const hotDeals = await HotDeal.find({});
    for (let hd of hotDeals) {
      let changed = false;
      
      const relatedProd = await Product.findById(hd.product_id);
      
      if (!hd.image_url || hd.image_url.trim() === '') {
        hd.image_url = relatedProd ? relatedProd.thumbnail : DEFAULT_HOTDEAL_IMG;
        changed = true;
      }
      if (!hd.title || hd.title.trim() === '') {
        hd.title = relatedProd ? `🔥 Deal: ${relatedProd.name}` : `Hot Deal`;
        changed = true;
      }
      
      if (hd.total_quantity === null && hd.stock_limit) {
        hd.total_quantity = hd.stock_limit;
        hd.remaining_quantity = Math.max(0, hd.stock_limit - (hd.sold_count || 0));
        changed = true;
      }

      if (changed) await hd.save();
    }

    console.log('Backfill Image + Props successfully completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runBackfill();
