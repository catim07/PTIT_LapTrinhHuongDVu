import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Coupon } from './models/Coupon.js';
import Promotion from './models/Promotion.js';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const cs = await Coupon.aggregate([{ $group: { _id: { vt: '$voucher_type', t: '$type' }, count: { $sum: 1 } } }]);
  console.log('=== Coupons ===');
  cs.forEach(s => console.log(`  voucher_type=${s._id.vt}, type=${s._id.t} → ${s.count}`));

  const ps = await Promotion.aggregate([{ $group: { _id: { vt: '$voucher_type', t: '$type' }, count: { $sum: 1 } } }]);
  console.log('=== Promotions ===');
  ps.forEach(s => console.log(`  voucher_type=${s._id.vt}, type=${s._id.t} → ${s.count}`));

  // Show all shipping vouchers
  const shipCoupons = await Coupon.find({ voucher_type: 'shipping' }).select('title type voucher_type code').lean();
  console.log('\n=== Shipping Coupons ===');
  shipCoupons.forEach(c => console.log(`  [${c.code}] ${c.title} (type=${c.type}, vt=${c.voucher_type})`));

  const shipPromos = await Promotion.find({ voucher_type: 'shipping' }).select('title type voucher_type').lean();
  console.log('\n=== Shipping Promotions ===');
  shipPromos.forEach(p => console.log(`  ${p.title} (type=${p.type}, vt=${p.voucher_type})`));

  process.exit(0);
});
