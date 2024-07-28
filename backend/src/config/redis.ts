import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export const initRedis = async (): Promise<void> => {
  await redisClient.connect();
};

export default redisClient;
