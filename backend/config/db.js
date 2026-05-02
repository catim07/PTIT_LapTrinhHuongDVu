import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('[startup][db] MONGODB_URI is missing. Server will continue without MongoDB connection.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
    });
    console.log(`[startup][db] MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error(`[startup][db] MongoDB connection error: ${err.message}`);
    return false;
  }
};

export default connectDB;
