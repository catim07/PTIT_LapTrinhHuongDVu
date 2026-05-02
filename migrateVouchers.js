import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Coupon } from './backend/models/Coupon.js';
import Promotion from './backend/models/Promotion.js';

dotenv.config({ path: './backend/.env' });

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lotte_mart_db', {
        });
        console.log('Connected to DB');

        // Step 1: Fix coupons with type 'free_shipping' — these MUST be voucher_type 'shipping'
        const { modifiedCount: couponShipCount } = await Coupon.updateMany(
            { type: 'free_shipping' },
            { $set: { voucher_type: 'shipping', claim_campaign: true, total_quantity: 100 } }
        );
        console.log(`Fixed ${couponShipCount} free_shipping coupons → voucher_type: shipping`);

        // Step 2: Fix promotions with type 'free_shipping' — these MUST be voucher_type 'shipping'
        const { modifiedCount: promoShipCount } = await Promotion.updateMany(
            { type: 'free_shipping' },
            { $set: { voucher_type: 'shipping', claim_campaign: true, total_quantity: 100 } }
        );
        console.log(`Fixed ${promoShipCount} free_shipping promotions → voucher_type: shipping`);

        // Step 3: Fix coupons/promotions that have title mentioning shipping
        const shippingTitleRegex = /vận chuyển|free ship|miễn phí ship|giảm phí ship/i;
        const { modifiedCount: couponTitleCount } = await Coupon.updateMany(
            { title: { $regex: shippingTitleRegex }, voucher_type: { $ne: 'shipping' } },
            { $set: { voucher_type: 'shipping' } }
        );
        console.log(`Fixed ${couponTitleCount} coupons by title → voucher_type: shipping`);

        const { modifiedCount: promoTitleCount } = await Promotion.updateMany(
            { title: { $regex: shippingTitleRegex }, voucher_type: { $ne: 'shipping' } },
            { $set: { voucher_type: 'shipping' } }
        );
        console.log(`Fixed ${promoTitleCount} promotions by title → voucher_type: shipping`);

        // Step 4: Backfill remaining items without voucher_type as 'product'
        const { modifiedCount: couponCount } = await Coupon.updateMany(
            { voucher_type: { $exists: false } },
            { $set: { voucher_type: 'product', claim_campaign: true, total_quantity: 100 } }
        );
        console.log(`Backfilled ${couponCount} coupons → voucher_type: product`);

        const { modifiedCount: promoCount } = await Promotion.updateMany(
            { voucher_type: { $exists: false } },
            { $set: { voucher_type: 'product', claim_campaign: true, total_quantity: 100 } }
        );
        console.log(`Backfilled ${promoCount} promotions → voucher_type: product`);

        // Step 5: Audit — print summary
        const couponSummary = await Coupon.aggregate([
            { $group: { _id: { voucher_type: '$voucher_type', type: '$type' }, count: { $sum: 1 } } }
        ]);
        console.log('\n=== Coupon Summary ===');
        couponSummary.forEach(s => console.log(`  voucher_type: ${s._id.voucher_type}, type: ${s._id.type} → ${s.count}`));

        const promoSummary = await Promotion.aggregate([
            { $group: { _id: { voucher_type: '$voucher_type', type: '$type' }, count: { $sum: 1 } } }
        ]);
        console.log('\n=== Promotion Summary ===');
        promoSummary.forEach(s => console.log(`  voucher_type: ${s._id.voucher_type}, type: ${s._id.type} → ${s.count}`));

        console.log('\nMigration complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
