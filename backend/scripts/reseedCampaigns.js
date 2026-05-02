import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Banner, HotDeal } from '../models/Misc.js';
import Promotion from '../models/Promotion.js';
import { Coupon } from '../models/Coupon.js';
import Product from '../models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lotte_mart_db');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();

  const product = await Product.findOne({});
  const productId = product ? product._id : 'dummy_product_id';
  console.log('Using product_id:', productId);

  // Fix existing coupons with wrong 'discount_type' field → should be 'type'
  const badCoupons = await Coupon.find({ type: { $exists: false } });
  if (badCoupons.length > 0) {
    console.log(`Fixing ${badCoupons.length} coupons with missing 'type' field...`);
    for (const c of badCoupons) {
      const raw = c.toObject();
      const correctType = raw.discount_type || 'percent';
      await Coupon.findByIdAndUpdate(c._id, { type: correctType });
    }
    console.log('Fixed coupon types');
  }

  // Ensure all coupons have total_quantity/remaining_quantity
  const couponsNoQty = await Coupon.find({ total_quantity: null, usage_limit: { $exists: true, $ne: null } });
  for (const c of couponsNoQty) {
    await Coupon.findByIdAndUpdate(c._id, {
      total_quantity: c.usage_limit,
      remaining_quantity: Math.max(0, (c.usage_limit || 0) - (c.used_count || 0)),
    });
  }
  if (couponsNoQty.length > 0) console.log(`Fixed ${couponsNoQty.length} coupons: added total_quantity/remaining_quantity`);

  // Ensure banners have both image and image_url synced
  const allBanners = await Banner.find({});
  let bannerFixCount = 0;
  for (const b of allBanners) {
    const updates = {};
    if (b.image && !b.image_url) updates.image_url = b.image;
    if (b.image_url && !b.image) updates.image = b.image_url;
    if (Object.keys(updates).length > 0) {
      await Banner.findByIdAndUpdate(b._id, updates);
      bannerFixCount++;
    }
  }
  if (bannerFixCount > 0) console.log(`Fixed ${bannerFixCount} banners: synced image/image_url`);

  // Ensure hot deals have remaining_quantity
  const dealsNoQty = await HotDeal.find({ remaining_quantity: null });
  for (const d of dealsNoQty) {
    await HotDeal.findByIdAndUpdate(d._id, {
      remaining_quantity: d.stock_limit || d.total_quantity || 100,
    });
  }
  if (dealsNoQty.length > 0) console.log(`Fixed ${dealsNoQty.length} hot deals: added remaining_quantity`);

  // If collections are empty, seed them
  const bannersCount = await Banner.countDocuments();
  if (bannersCount === 0) {
    console.log('Seeding 3 banners...');
    await Banner.insertMany([
      { title: 'Siêu Sale Lotte 4.4', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070', image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070', link: '/promotions', position: 'home', is_active: true },
      { title: 'Tươi Xanh Mỗi Ngày', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974', link: '/products', position: 'home', is_active: true },
      { title: 'Thịt Bò Nhập Khẩu Đỉnh', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=2070', image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=2070', link: '/products', position: 'home', is_active: true }
    ]);
  }

  const promosCount = await Promotion.countDocuments();
  if (promosCount === 0) {
    console.log('Seeding promotions...');
    await Promotion.insertMany([
      { title: 'Khuyến mãi rau sạch nhập trong ngày', type: 'percent', discount_value: 15, is_active: true, status: 'active', scope: 'all', image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2042', start_date: new Date(), end_date: new Date(Date.now() + 30 * 86400000) },
      { title: 'Flash sale mì gói', type: 'fixed_amount', discount_value: 20000, is_active: true, status: 'active', scope: 'all', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1964', start_date: new Date(), end_date: new Date(Date.now() + 14 * 86400000) },
      { title: 'Mua 1 tặng 1 sữa tươi', type: 'bogo', min_quantity: 1, gift_quantity: 1, is_active: true, status: 'active', scope: 'all', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=1965', start_date: new Date(), end_date: new Date(Date.now() + 7 * 86400000) },
      { title: 'Miễn phí giao hàng từ 300K', type: 'free_shipping', min_order_amount: 300000, is_active: true, status: 'active', scope: 'all', image: 'https://images.unsplash.com/photo-1620021666023-e18eebdce6a6?q=80&w=2028', start_date: new Date(), end_date: new Date(Date.now() + 60 * 86400000) },
      { title: 'Khuyến mãi chăn ga', type: 'percent', discount_value: 50, is_active: false, status: 'paused', scope: 'all', image: 'https://images.unsplash.com/photo-1522771731478-4a92c4cdca4d?q=80&w=2070' }
    ]);
  }

  const couponsCount = await Coupon.countDocuments();
  if (couponsCount === 0) {
    console.log('Seeding coupons...');
    await Coupon.insertMany([
      { code: 'GIAM50K', title: 'Giảm 50K cho đơn trên 500K', type: 'fixed_amount', discount_value: 50000, min_order_amount: 500000, is_active: true, status: 'active', usage_limit: 1000, total_quantity: 1000, remaining_quantity: 1000 },
      { code: 'LOTTE10', title: 'Giảm 10% khách hàng mới', type: 'percent', discount_value: 10, max_discount_amount: 100000, is_active: true, status: 'active', usage_limit: 1500, total_quantity: 1500, remaining_quantity: 1500 },
      { code: 'FREESHIP10', title: 'Miễn phí vận chuyển 30k', type: 'free_shipping', discount_value: 30000, is_active: true, status: 'active', min_order_amount: 100000, usage_limit: 2000, total_quantity: 2000, remaining_quantity: 2000 },
      { code: 'FRUITS25', title: 'Giảm 25% trái cây nhập', type: 'percent', discount_value: 25, is_active: true, status: 'active', max_discount_amount: 50000, usage_limit: 800, total_quantity: 800, remaining_quantity: 800 },
      { code: 'WELCOMEBACK', title: 'Tặng 100K cho khách cũ', type: 'fixed_amount', discount_value: 100000, is_active: false, status: 'paused', usage_limit: 500, total_quantity: 500, remaining_quantity: 500 }
    ]);
  }

  const hotDealsCount = await HotDeal.countDocuments();
  if (hotDealsCount === 0) {
    console.log('Seeding hot deals...');
    await HotDeal.insertMany([
      { title: 'Táo Rockit Mỹ', product_id: productId, type: 'percent', discount_percent: 30, discount_value: 30, original_price: 150000, deal_price: 105000, stock_limit: 100, remaining_quantity: 100, total_quantity: 100, sold_count: 0, is_active: true, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?q=80&w=1974' },
      { title: 'Cá Hồi Na-uy', product_id: productId, type: 'fixed_amount', discount_percent: 15, discount_value: 15000, original_price: 300000, deal_price: 285000, stock_limit: 200, remaining_quantity: 150, total_quantity: 200, sold_count: 50, is_active: true, image_url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=2070' },
      { title: 'Bia Heineken Xám', product_id: productId, type: 'percent', discount_percent: 10, discount_value: 10, original_price: 450000, deal_price: 405000, stock_limit: 500, remaining_quantity: 300, total_quantity: 500, sold_count: 200, is_active: true, image_url: 'https://images.unsplash.com/photo-1614316238328-97ebd286d9ed?q=80&w=2014' },
      { title: 'Set Sushi Cao Cấp', product_id: productId, type: 'percent', discount_percent: 40, discount_value: 40, original_price: 250000, deal_price: 150000, stock_limit: 50, remaining_quantity: 10, total_quantity: 50, sold_count: 40, is_active: true, image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070' },
      { title: 'Bò Mỹ Wagyu A5', product_id: productId, type: 'percent', discount_percent: 50, discount_value: 50, original_price: 1500000, deal_price: 750000, stock_limit: 20, remaining_quantity: 5, total_quantity: 20, sold_count: 15, is_active: true, image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=2070' }
    ]);
  }

  // Summary
  console.log('\n=== SEED SUMMARY ===');
  console.log('Banners:', await Banner.countDocuments());
  console.log('Promotions:', await Promotion.countDocuments());
  console.log('Coupons:', await Coupon.countDocuments());
  console.log('Hot Deals:', await HotDeal.countDocuments());
  console.log('Seed completed successfully');
  process.exit(0);
};

runSeed();
