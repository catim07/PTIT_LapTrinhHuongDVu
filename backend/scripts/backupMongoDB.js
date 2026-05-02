// backend/scripts/backupMongoDB.js
// ═══════════════════════════════════════════════════════
// Automated MongoDB Backup Strategy
// Runs as a cron job (daily) or can be invoked manually.
// Stores backup metadata in the BackupMeta collection.
// ═══════════════════════════════════════════════════════
import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

// Backup metadata model
const backupMetaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size_bytes: { type: Number, default: 0 },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'IN_PROGRESS'], default: 'IN_PROGRESS' },
  started_at: { type: Date, default: Date.now },
  completed_at: { type: Date, default: null },
  error: { type: String, default: null },
  database: { type: String, default: '' },
  collections_count: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at' } });

export const BackupMeta = mongoose.models.BackupMeta || mongoose.model('BackupMeta', backupMetaSchema);

/**
 * Perform a MongoDB backup using mongodump (if available)
 * Falls back to a JSON export if mongodump is not installed.
 */
export async function performBackup() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lotte_mart';
  const backupDir = path.resolve(process.cwd(), 'backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup_${timestamp}`;
  const backupPath = path.join(backupDir, backupName);

  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Create metadata entry
  const meta = await BackupMeta.create({
    filename: backupName,
    path: backupPath,
    database: mongoUri.split('/').pop()?.split('?')[0] || 'lotte_mart',
    status: 'IN_PROGRESS',
    started_at: new Date(),
  });

  try {
    // Attempt mongodump first
    try {
      await execAsync(`mongodump --uri="${mongoUri}" --out="${backupPath}" --gzip`, {
        timeout: 300000, // 5 minute timeout
      });

      // Calculate total backup size
      let totalSize = 0;
      const walkDir = (dir) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) walkDir(filePath);
          else totalSize += stat.size;
        }
      };
      walkDir(backupPath);

      meta.size_bytes = totalSize;
      meta.status = 'SUCCESS';
      meta.completed_at = new Date();
      await meta.save();

      console.log(`✅ MongoDB backup completed: ${backupName} (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
      return meta;
    } catch (dumpErr) {
      // mongodump not available — fallback to JSON export
      console.warn('⚠️ mongodump not available, using JSON export fallback');

      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }

      const collections = await mongoose.connection.db.listCollections().toArray();
      let totalSize = 0;

      for (const col of collections) {
        try {
          const docs = await mongoose.connection.db.collection(col.name).find({}).toArray();
          const jsonData = JSON.stringify(docs, null, 0);
          const filePath = path.join(backupPath, `${col.name}.json`);
          fs.writeFileSync(filePath, jsonData);
          totalSize += Buffer.byteLength(jsonData);
        } catch (colErr) {
          console.warn(`  ⚠️ Failed to export ${col.name}: ${colErr.message}`);
        }
      }

      meta.size_bytes = totalSize;
      meta.collections_count = collections.length;
      meta.status = 'SUCCESS';
      meta.completed_at = new Date();
      await meta.save();

      console.log(`✅ JSON backup completed: ${backupName} (${collections.length} collections, ${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
      return meta;
    }
  } catch (err) {
    meta.status = 'FAILED';
    meta.error = err.message;
    meta.completed_at = new Date();
    await meta.save();

    console.error(`❌ Backup failed: ${err.message}`);
    return meta;
  }
}

/**
 * Get backup history
 */
export async function getBackupHistory(limit = 20) {
  return BackupMeta.find().sort({ created_at: -1 }).limit(limit);
}

/**
 * Cleanup old backups (keep last N)
 */
export async function cleanupOldBackups(keepCount = 7) {
  const backups = await BackupMeta.find({ status: 'SUCCESS' }).sort({ created_at: -1 });
  const toDelete = backups.slice(keepCount);

  for (const backup of toDelete) {
    try {
      if (fs.existsSync(backup.path)) {
        fs.rmSync(backup.path, { recursive: true, force: true });
      }
      await BackupMeta.findByIdAndDelete(backup._id);
    } catch (err) {
      console.warn(`Failed to cleanup backup ${backup.filename}: ${err.message}`);
    }
  }

  return toDelete.length;
}
