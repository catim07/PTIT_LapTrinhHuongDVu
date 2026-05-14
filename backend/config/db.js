import mongoose from 'mongoose';

let reconnectTimer = null;
let authFailed = false; // Track permanent auth failures

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  maxPoolSize: 10,
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('[db] ❌ MONGODB_URI is missing. Server will continue without database.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, MONGO_OPTIONS);
    console.log(`[db] ✅ MongoDB connected: ${conn.connection.host}`);
    authFailed = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    return true;
  } catch (err) {
    const msg = err.message || '';

    // Detect permanent auth failures — do NOT retry with bad credentials
    if (msg.includes('bad auth') || msg.includes('Authentication failed') || msg.includes('auth failed')) {
      authFailed = true;
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('[db] ❌ MONGODB AUTHENTICATION FAILED');
      console.error('[db]    The database credentials in .env are incorrect.');
      console.error('[db]    Please update MONGODB_URI with valid credentials.');
      console.error('[db]    Server will continue in degraded mode (no database).');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
      // Do NOT schedule reconnect — credentials won't magically fix themselves
      return false;
    }

    // Network error — schedule reconnect
    console.error(`[db] ⚠️ MongoDB connection error: ${msg}`);
    scheduleReconnect(mongoUri);
    return false;
  }
};

const scheduleReconnect = (mongoUri, delay = 10000) => {
  if (reconnectTimer || authFailed) return;
  console.log(`[db] Will attempt reconnect in ${delay / 1000}s...`);
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      if (mongoose.connection.readyState === 1) return;
      await mongoose.connect(mongoUri, MONGO_OPTIONS);
      console.log('[db] ✅ MongoDB reconnected successfully.');
      authFailed = false;
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
        authFailed = true;
        console.error('[db] ❌ Reconnect failed: authentication error. Stopping retry.');
        return;
      }
      console.error(`[db] ⚠️ Reconnect failed: ${msg}`);
      scheduleReconnect(mongoUri, Math.min(delay * 2, 60000));
    }
  }, delay);
};

// Auto-reconnect on disconnection (only for network issues, not auth)
mongoose.connection.on('disconnected', () => {
  if (authFailed) return; // Don't spam reconnect with bad creds
  console.warn('[db] MongoDB disconnected.');
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) scheduleReconnect(mongoUri);
});

export default connectDB;
