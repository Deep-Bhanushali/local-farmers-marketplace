import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;


if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log("Connected to MongoDB successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error.message);
        if (error.message.includes("Password contains unescaped characters")) {
          console.error(
            "Please URL-encode special characters in your MongoDB password"
          );
          console.error(
            "Common replacements: @=%40, #=%23, $=%24, %=%25, &=%26, +=%2B, /=%2F, :=%3A, ==%3D, ?=%3F"
          );
        }
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
