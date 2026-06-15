import dotenv from "dotenv";

dotenv.config({ override: true });

const requiredVars = ["MONGO_URI", "JWT_SECRET"];
const missing = requiredVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
  console.error("Please set them in your .env file or environment.");
  process.exit(1);
}

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5500",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  REDIS_URI: process.env.REDIS_URI || "",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
};

export const validateEnv = () => {
  const warnings = [];
  if (!env.GEMINI_API_KEY) warnings.push("GEMINI_API_KEY not set — AI features will fail");
  if (!env.REDIS_URI) warnings.push("REDIS_URI not set — background queues will be unavailable");
  if (!env.EMAIL_USER || !env.EMAIL_PASS) warnings.push("EMAIL_USER/PASS not set — email notifications will not work");
  return warnings;
};

export default env;
