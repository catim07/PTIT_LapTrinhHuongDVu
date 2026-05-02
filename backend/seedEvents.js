import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventPost } from './models/EventPost.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const seedEvents = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lotte_mart';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB', uri);

    const mockDataPath = path.join(__dirname, '../fontend/mockData.json');
    const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
    
    if (!mockData.event_posts) {
      console.log('No event_posts found in mockData.json');
      process.exit(1);
    }

    const eventsToInsert = [];
    
    for (const post of mockData.event_posts) {
      const p = { ...post };
      if (p.published_at) p.published_at = new Date(p.published_at);
      if (p.start_date) p.start_date = new Date(p.start_date);
      if (p.end_date) p.end_date = new Date(p.end_date);
      if (p.created_at) p.created_at = new Date(p.created_at);
      if (p.updated_at) p.updated_at = new Date(p.updated_at);

      if (!p.slug) continue;

      const existing = await EventPost.findOne({ slug: p.slug });
      if (!existing && !eventsToInsert.some(e => e.slug === p.slug)) {
        eventsToInsert.push(p);
      }
    }

    if (eventsToInsert.length > 0) {
      await EventPost.insertMany(eventsToInsert);
      console.log(`Inserted ${eventsToInsert.length} events`);
    } else {
      console.log('No new events to insert (already exist or skipped)');
    }

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedEvents();
