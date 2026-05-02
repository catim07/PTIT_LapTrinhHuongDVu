/**
 * Seed script for marketing data: Banners, Promotions, Coupons, Hot Deals
 * Run: node --experimental-modules seed/seedMarketingData.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { Banner, HotDeal } from '../models/Misc.js';
import Promotion from '../models/Promotion.js';
import { Coupon } from '../models/Coupon.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lottemart';

const now = new Date();
const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

const seedBanners = [
  {
    title: 'Siêu Sale Cuối Tuần <br/>Giảm Đến <span style="color:#E53935">50%</span>',
    subtitle: 'Ưu đãi hấp dẫn cho tất cả sản phẩm',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1200',
    image_url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1200',
    alt_text: 'Siêu Sale Cuối Tuần',
    link: '/promotions',
    link_type: 'url',
    position: 'home',
    sort_order: 0,
    priority: 10,
    is_active: true,
    start_date: pastDate(1),
    end_date: futureDate(30),
  },
  {
    title: 'Trái Cây Nhập Khẩu <br/>Tươi Mới Mỗi Ngày',
    subtitle: 'Từ các vùng trồng nổi tiếng',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800',
    image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800',
    alt_text: 'Trái Cây Nhập Khẩu',
    link: '/products?category=fruits',
    link_type: 'url',
    position: 'home',
    sort_order: 1,
    priority: 5,
    is_active: true,
    start_date: pastDate(1),
    end_date: futureDate(60),
  },
  {
    title: 'Thực Phẩm Hữu Cơ <br/>An Toàn Cho Gia Đình',
    subtitle: 'Organic & Natural',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800',
    alt_text: 'Thực Phẩm Hữu Cơ',
    link: '/products?category=organic',
    link_type: 'url',
    position: 'home',
    sort_order: 2,
    priority: 3,
    is_active: true,
    start_date: pastDate(1),
    end_date: futureDate(90),
  },
];

const seedPromotions = [
  {
    title: 'Flash Sale Cuối Tuần - Giảm 30% Toàn Bộ',
    description: 'Áp dụng cho tất cả sản phẩm tại Lotte Mart, giảm ngay 30% khi mua từ 500.000đ',
    type: 'percent',
    status: 'active',
    is_active: true,
    discount_value: 30,
    max_discount_amount: 200000,
    min_order_amount: 500000,
    scope: 'all',
    start_date: pastDate(1),
    end_date: futureDate(14),
    total_quantity: 500,
    remaining_quantity: 480,
    claimed_count: 20,
    usage_per_user: 2,
    priority: 10,
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e1f?q=80&w=800',
    banner_image: 'https://images.unsplash.com/photo-1607082349566-187342175e1f?q=80&w=800',
    badge_text: 'HOT',
  },
  {
    title: 'Mua 2 Tặng 1 - Sữa Tươi Lotte',
    description: 'Mua 2 hộp sữa tươi bất kỳ, tặng ngay 1 hộp cùng loại',
    type: 'bogo',
    status: 'active',
    is_active: true,
    min_quantity: 2,
    gift_quantity: 1,
    scope: 'all',
    start_date: pastDate(3),
    end_date: futureDate(21),
    total_quantity: 200,
    remaining_quantity: 185,
    claimed_count: 15,
    usage_per_user: 3,
    priority: 8,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=800',
    banner_image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=800',
    badge_text: 'BOGO',
  },
  {
    title: 'Miễn Phí Vận Chuyển - Đơn Từ 300K',
    description: 'Free ship cho mọi đơn hàng từ 300.000đ trở lên, áp dụng toàn quốc',
    type: 'free_shipping',
    status: 'active',
    is_active: true,
    min_order_amount: 300000,
    scope: 'all',
    start_date: pastDate(7),
    end_date: futureDate(30),
    total_quantity: 1000,
    remaining_quantity: 920,
    claimed_count: 80,
    usage_per_user: 5,
    priority: 7,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800',
    banner_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800',
    badge_text: 'FREE SHIP',
  },
  {
    title: 'Giảm 50K Cho Đơn Đầu Tiên',
    description: 'Ưu đãi cho khách mới: Giảm ngay 50.000đ cho đơn hàng đầu tiên',
    type: 'fixed_amount',
    status: 'active',
    is_active: true,
    discount_value: 50000,
    min_order_amount: 200000,
    scope: 'all',
    start_date: pastDate(5),
    end_date: futureDate(60),
    total_quantity: 800,
    remaining_quantity: 750,
    claimed_count: 50,
    usage_per_user: 1,
    priority: 6,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800',
    banner_image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800',
    badge_text: 'NEW USER',
  },
  {
    title: 'Tích Điểm X3 - Thứ 6 Hàng Tuần',
    description: 'Nhân 3 điểm thưởng cho mọi đơn hàng vào thứ 6 hàng tuần',
    type: 'points_multiplier',
    status: 'active',
    is_active: true,
    points_multiplier: 3,
    scope: 'all',
    start_date: pastDate(2),
    end_date: futureDate(30),
    total_quantity: null,
    usage_per_user: 10,
    priority: 5,
    image: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?q=80&w=800',
    banner_image: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?q=80&w=800',
    badge_text: 'X3 POINTS',
  },
];

const seedCoupons = [
  {
    code: 'LOTTENEW50',
    title: 'Giảm 50K - Khách Mới',
    description: 'Mã giảm 50.000đ cho khách hàng mới đăng ký tài khoản, áp dụng cho đơn từ 200.000đ',
    type: 'fixed_amount',
    discount_value: 50000,
    min_order_amount: 200000,
    total_quantity: 500,
    remaining_quantity: 480,
    usage_per_user: 1,
    is_active: true,
    status: 'active',
    start_date: pastDate(10),
    end_date: futureDate(60),
    scope: 'all',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400',
  },
  {
    code: 'GIAM10',
    title: 'Giảm 10% Toàn Bộ',
    description: 'Giảm 10% cho tất cả sản phẩm, tối đa 100.000đ. Đơn tối thiểu 300.000đ',
    type: 'percent',
    discount_value: 10,
    max_discount_amount: 100000,
    min_order_amount: 300000,
    total_quantity: 1000,
    remaining_quantity: 780,
    used_count: 220,
    usage_per_user: 3,
    is_active: true,
    status: 'active',
    start_date: pastDate(5),
    end_date: futureDate(30),
    scope: 'all',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e1f?q=80&w=400',
  },
  {
    code: 'FREESHIP',
    title: 'Miễn Phí Vận Chuyển',
    description: 'Miễn phí vận chuyển cho đơn từ 150.000đ',
    type: 'free_shipping',
    discount_value: 0,
    min_order_amount: 150000,
    total_quantity: 2000,
    remaining_quantity: 1500,
    used_count: 500,
    usage_per_user: 5,
    is_active: true,
    status: 'active',
    start_date: pastDate(15),
    end_date: futureDate(45),
    scope: 'all',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400',
  },
  {
    code: 'SUMMER25',
    title: 'Summer Sale 25%',
    description: 'Giảm 25% cho đồ uống và kem, tối đa giảm 80.000đ',
    type: 'percent',
    discount_value: 25,
    max_discount_amount: 80000,
    min_order_amount: 100000,
    total_quantity: 300,
    remaining_quantity: 250,
    used_count: 50,
    usage_per_user: 2,
    is_active: true,
    status: 'active',
    start_date: pastDate(2),
    end_date: futureDate(20),
    scope: 'all',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400',
  },
  {
    code: 'LOYALTY100',
    title: 'Điểm Thưởng X2',
    description: 'Nhân đôi điểm thưởng cho thành viên Kim Cương',
    type: 'points',
    discount_value: 100,
    min_order_amount: 0,
    total_quantity: null,
    usage_per_user: 10,
    is_active: true,
    status: 'active',
    start_date: pastDate(3),
    end_date: futureDate(90),
    scope: 'all',
    image: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?q=80&w=400',
  },
];

const seedHotDeals = [
  {
    title: 'Thịt Bò Wagyu Nhật - Flash Deal',
    description: 'Thịt bò Wagyu A5 nhập khẩu trực tiếp từ Nhật Bản',
    product_id: 'WAGYU001',
    discount_percent: 40,
    discount_value: 40,
    type: 'percent',
    original_price: 1200000,
    deal_price: 720000,
    start_date: pastDate(1),
    end_date: futureDate(3),
    total_quantity: 50,
    remaining_quantity: 35,
    stock_limit: 50,
    sold_count: 15,
    is_active: true,
    priority: 10,
    image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?q=80&w=600',
    badge_text: 'FLASH',
  },
  {
    title: 'Dầu Olive Extra Virgin 1L',
    description: 'Dầu olive nguyên chất từ Ý, chất lượng cao',
    product_id: 'OLIVE001',
    discount_percent: 35,
    discount_value: 35,
    type: 'percent',
    original_price: 380000,
    deal_price: 247000,
    start_date: pastDate(2),
    end_date: futureDate(5),
    total_quantity: 100,
    remaining_quantity: 72,
    stock_limit: 100,
    sold_count: 28,
    is_active: true,
    priority: 8,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600',
    badge_text: '-35%',
  },
  {
    title: 'Set Mỹ Phẩm Hàn Quốc Premium',
    description: 'Bộ chăm sóc da 6 bước từ thương hiệu Hàn Quốc',
    product_id: 'KBEAUTY01',
    discount_percent: 50,
    discount_value: 50,
    type: 'percent',
    original_price: 2500000,
    deal_price: 1250000,
    start_date: pastDate(1),
    end_date: futureDate(7),
    total_quantity: 30,
    remaining_quantity: 18,
    stock_limit: 30,
    sold_count: 12,
    is_active: true,
    priority: 9,
    image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600',
    badge_text: '-50%',
  },
  {
    title: 'Cà Phê Rang Xay Đặc Biệt 500g',
    description: 'Blend đặc biệt từ Đà Lạt và Buôn Ma Thuột',
    product_id: 'COFFEE001',
    discount_percent: 25,
    discount_value: 25,
    type: 'percent',
    original_price: 280000,
    deal_price: 210000,
    start_date: pastDate(3),
    end_date: futureDate(10),
    total_quantity: 200,
    remaining_quantity: 155,
    stock_limit: 200,
    sold_count: 45,
    is_active: true,
    priority: 7,
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600',
    badge_text: '-25%',
  },
  {
    title: 'Máy Xay Sinh Tố Đa Năng',
    description: 'Máy xay công suất lớn 1200W, nhiều chế độ xay',
    product_id: 'BLENDER01',
    discount_percent: 45,
    discount_value: 45,
    type: 'percent',
    original_price: 1800000,
    deal_price: 990000,
    start_date: pastDate(1),
    end_date: futureDate(5),
    total_quantity: 20,
    remaining_quantity: 12,
    stock_limit: 20,
    sold_count: 8,
    is_active: true,
    priority: 6,
    image_url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=600',
    badge_text: 'HOT',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    // Seed Banners (only if empty)
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.insertMany(seedBanners);
      console.log(`✅ Seeded ${seedBanners.length} banners`);
    } else {
      console.log(`⏭️  Banners already exist (${bannerCount}), skipping`);
    }

    // Seed Promotions (only if empty)
    const promoCount = await Promotion.countDocuments();
    if (promoCount === 0) {
      await Promotion.insertMany(seedPromotions);
      console.log(`✅ Seeded ${seedPromotions.length} promotions`);
    } else {
      console.log(`⏭️  Promotions already exist (${promoCount}), skipping`);
    }

    // Seed Coupons (only if empty)
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany(seedCoupons);
      console.log(`✅ Seeded ${seedCoupons.length} coupons`);
    } else {
      console.log(`⏭️  Coupons already exist (${couponCount}), skipping`);
    }

    // Seed Hot Deals (only if empty)
    const hotDealCount = await HotDeal.countDocuments();
    if (hotDealCount === 0) {
      await HotDeal.insertMany(seedHotDeals);
      console.log(`✅ Seeded ${seedHotDeals.length} hot deals`);
    } else {
      console.log(`⏭️  Hot Deals already exist (${hotDealCount}), skipping`);
    }

    console.log('\n🎉 Marketing data seed complete!');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
