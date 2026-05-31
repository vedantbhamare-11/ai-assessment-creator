// ./config/queue.ts
import { Queue } from 'bullmq';
import { Redis } from 'ioredis'; // Keep this standard import
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Setup reusable Redis connection instance using object structure or URL
export const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // Critical requirement for BullMQ
});

// Pass the connection directly into the option block
export const assessmentQueue = new Queue('assessmentGeneration', {
  connection: connection as any, // 💡 Typecast to 'any' to bypass package-nesting version conflicts safely
  defaultJobOptions: {
    attempts: 3, 
    backoff: {
      type: 'exponential',
      delay: 2000, 
    },
  },
});

console.log('🛑 Redis connection established and BullMQ initialized.');