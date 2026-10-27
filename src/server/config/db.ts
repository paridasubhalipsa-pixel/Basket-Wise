import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { db } from '../db/storageEngine.js';

dotenv.config();

let isMongoConnected = false;

export const connectDB = async (): Promise<boolean> => {
  // Always initialize local persistent storage engine first
  await db.init();

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('[BasketWise DB] No MONGODB_URI provided. Running in persistent embedded storage mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[BasketWise DB] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[BasketWise DB] MongoDB connection could not be established (${(error as Error).message}). Operating smoothly with persistent storage engine.`);
    isMongoConnected = false;
    return false;
  }
};

export const getMongoConnectionStatus = () => isMongoConnected;
