import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Banner } from './models/Misc.js';

dotenv.config();

const seedBanners = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lotte_mart';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB', uri);

    const count = await Banner.countDocuments({ is_active: true });
    if (count < 3) {
      console.log(`Only ${count} banners exist, seeding 3 banners...`);
      await Banner.deleteMany({}); // clear existing
      await Banner.insertMany([
        {
          title: "Weekend Super <span class='text-primary'>Special</span>",
          image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
          link: "/promotions",
          position: "home",
          sort_order: 1,
          is_active: true
        },
        {
          title: "New Arrival",
          description: "Discover fresh organic products",
          image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
          link: "/products?category=grocery",
          position: "home",
          sort_order: 2,
          is_active: true
        },
        {
          title: "Summer Clearance",
          description: "Up to 50% OFF",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
          link: "/promotions",
          position: "home",
          sort_order: 3,
          is_active: true
        }
      ]);
      console.log('Seeded 3 banners successfully');
    } else {
      console.log(`${count} banners already exist. No action needed.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedBanners();
