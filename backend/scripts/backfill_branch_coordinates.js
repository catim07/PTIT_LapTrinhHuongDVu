/**
 * Backfill Branch Coordinates
 * 
 * One-time script to add GPS coordinates to existing branch documents.
 * Maps real Lotte Mart Vietnam locations.
 * 
 * Usage: node scripts/backfill_branch_coordinates.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Branch from '../models/Branch.js';

const KNOWN_COORDINATES = {
  // Mapping by city / known address keywords
  'Hà Nội': { lat: 21.0116, lng: 105.8341 },      // Lotte Mart Đống Đa
  'HCM': { lat: 10.7714, lng: 106.6598 },           // Lotte Mart Quận 7
  'Hồ Chí Minh': { lat: 10.7714, lng: 106.6598 },
  'Đà Nẵng': { lat: 16.0544, lng: 108.2022 },
  'Vũng Tàu': { lat: 10.3501, lng: 107.0843 },
  'Nha Trang': { lat: 12.2388, lng: 109.1967 },
  'Cần Thơ': { lat: 10.0452, lng: 105.7469 },
  'Bình Dương': { lat: 11.0025, lng: 106.6520 },
  'Hải Phòng': { lat: 20.8449, lng: 106.6881 },
  'Đồng Nai': { lat: 10.9453, lng: 106.8243 },
};

// More specific mapping by branch name keywords
const NAME_COORDINATES = {
  'Quận 7': { lat: 10.7380, lng: 106.7218 },
  'Nam Sài Gòn': { lat: 10.7380, lng: 106.7218 },
  'Gò Vấp': { lat: 10.8326, lng: 106.6676 },
  'Tân Bình': { lat: 10.8019, lng: 106.6528 },
  'Đống Đa': { lat: 21.0116, lng: 105.8341 },
  'Tây Sơn': { lat: 21.0116, lng: 105.8341 },
  'Mipec': { lat: 20.9930, lng: 105.8573 },
  'Liễu Giai': { lat: 21.0355, lng: 105.8218 },
};

function guessCoordinates(branch) {
  // Check name first (more specific)
  for (const [key, coords] of Object.entries(NAME_COORDINATES)) {
    if ((branch.name || '').includes(key) || (branch.address || '').includes(key)) {
      // Add slight random offset to avoid marker stacking
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.002,
        lng: coords.lng + (Math.random() - 0.5) * 0.002,
      };
    }
  }
  // Fallback to city
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if ((branch.city || '').includes(key) || (branch.name || '').includes(key) || (branch.address || '').includes(key)) {
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.005,
        lng: coords.lng + (Math.random() - 0.5) * 0.005,
      };
    }
  }
  // Default center of Vietnam
  return {
    lat: 14.0583 + (Math.random() - 0.5) * 2,
    lng: 108.2772 + (Math.random() - 0.5) * 2,
  };
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const branches = await Branch.find();
  console.log(`Found ${branches.length} branches`);

  let updated = 0;
  for (const branch of branches) {
    if (!branch.coordinates || (!branch.coordinates.lat && !branch.coordinates.lng)) {
      const coords = guessCoordinates(branch);
      branch.coordinates = coords;
      await branch.save();
      console.log(`  ✅ ${branch.name} → (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
      updated++;
    } else {
      console.log(`  ⏭  ${branch.name} already has coordinates`);
    }
  }

  console.log(`\nDone. Updated ${updated}/${branches.length} branches.`);
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
