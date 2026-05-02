import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import BranchProduct from '../models/BranchProduct.js';
import Category from '../models/Category.js';

dotenv.config();

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lotte_mart');
    console.log('Connected to MongoDB. Starting migration...');

    const categories = await Category.find();
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.id || c._id] = c.name);

    const products = await Product.find();
    for (const p of products) {
        let updated = false;
        if (!p.sku) { p.sku = 'SKU-' + p._id.toString().slice(-6).toUpperCase(); updated = true; }
        if (!p.master_id) { p.master_id = 'MAS-' + p._id.toString().slice(-8).toUpperCase(); updated = true; }
        if (!p.supplier_name) { p.supplier_name = 'Unknown'; updated = true; }
        if (p.category_id && !p.category_name) { p.category_name = categoryMap[p.category_id] || 'N/A'; updated = true; }
        if (!p.batch_code) { p.batch_code = 'BATCH-INITIAL'; updated = true; }
        if (!p.manufacture_date) { p.manufacture_date = new Date('2024-01-15T00:00:00Z'); updated = true; }
        if (!p.expiry_date) { p.expiry_date = new Date('2026-12-31T00:00:00Z'); updated = true; }

        if (updated) await p.save();
    }
    console.log('Migrated Master Products:', products.length);

    const branchProducts = await BranchProduct.find();
    for (const bp of branchProducts) {
        let updated = false;
        if (!bp.sku || !bp.supplier_name || !bp.batch_code || !bp.category_name) {
            const p = await Product.findById(bp.product_id);
            if (p) {
                bp.sku = p.sku;
                bp.master_id = p.master_id;
                bp.category_name = p.category_name;
                bp.supplier_name = p.supplier_name;
                bp.batch_code = p.batch_code;
                bp.manufacture_date = p.manufacture_date;
                bp.expiry_date = p.expiry_date;
                updated = true;
            }
        }
        if (updated) await bp.save();
    }
    console.log('Migrated Branch Products:', branchProducts.length);

    console.log('Migration Completed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runMigration();
