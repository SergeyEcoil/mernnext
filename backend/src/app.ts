import express from "express";
import session from "express-session";
import { createClient, RedisClientType } from "redis";
import RedisStore from "connect-redis";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import noteRoutes from "./routes/notes";
import connectDB from "./config/database";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    // Connect to Redis
    const redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    await redisClient.connect();

    // Create RedisStore
  const redisStore = new (RedisStore as any)({
    client: redisClient as RedisClientType<any>,
    prefix: "myapp:",
  });


    // Set up session middleware
    app.use(
      session({
        store: redisStore,
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === "production",
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
        },
      })
    );

    app.use("/api/auth", authRoutes);
    app.use("/api/notes", noteRoutes);

    // Connect to MongoDB
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
