import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ override: true });

// Check if REDIS_URI exists
const redisUri = process.env.REDIS_URI;

// We export a function or object that BullMQ can use.
// BullMQ requires maxRetriesPerRequest to be null
const connectionOptions = {
    maxRetriesPerRequest: null,
};

// Create the Redis connection
const connection = redisUri ? new Redis(redisUri, connectionOptions) : null;

if (!connection) {
    console.warn("⚠️ REDIS_URI is not set in .env. Background queues will fail until Redis is configured.");
} else {
    connection.on('error', (err) => {
        console.error("❌ Redis Connection Error:", err);
    });
    connection.on('ready', () => {
        console.log("✅ Redis Connected successfully");
    });
}

export default connection;
