/**
 * Migration Script: Backfill `authProviders` for existing users
 * 
 * This script reads each user and populates the `authProviders` array
 * based on existing fields (login_provider, googleId, facebookId, password_hash).
 * 
 * Run ONCE after deploying the auth security update:
 *   node scripts/backfill_authProviders.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌ Missing MONGODB_URI in .env');
    process.exit(1);
}

async function main() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const cursor = usersCollection.find({
        $or: [
            { authProviders: { $exists: false } },
            { authProviders: { $size: 0 } },
            { authProviders: null },
        ],
    });

    let updated = 0;
    let skipped = 0;
    let total = 0;

    for await (const user of cursor) {
        total++;
        const providers = new Set();

        // Infer from login_provider
        const lp = String(user.login_provider || '').toLowerCase();
        if (lp === 'google') providers.add('google');
        if (lp === 'facebook') providers.add('facebook');
        if (lp === 'phone') providers.add('phone');
        if (lp === 'local') providers.add('local');

        // Infer from signup_method
        const sm = String(user.signup_method || '').toLowerCase();
        if (sm === 'google') providers.add('google');
        if (sm === 'facebook') providers.add('facebook');
        if (sm === 'phone') providers.add('phone');
        if (sm === 'email' || sm === 'local') providers.add('local');

        // Infer from googleId / facebookId
        if (user.googleId) providers.add('google');
        if (user.facebookId || user.facebook_id) providers.add('facebook');

        // If user has a password_hash, they have 'local' auth
        if (user.password_hash) providers.add('local');

        // Infer from social_providers array
        if (Array.isArray(user.social_providers)) {
            for (const sp of user.social_providers) {
                if (sp?.provider === 'google') providers.add('google');
                if (sp?.provider === 'facebook') providers.add('facebook');
            }
        }

        // Fallback: if still empty, default to 'local'
        if (providers.size === 0) {
            providers.add('local');
        }

        const authProviders = Array.from(providers);

        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { authProviders } }
        );

        updated++;
        if (updated % 100 === 0) {
            console.log(`  … processed ${updated} users`);
        }
    }

    console.log(`\n🎉 Done! Total: ${total} | Updated: ${updated} | Skipped: ${skipped}`);
    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
