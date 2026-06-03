const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];

export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ CRITICAL: Missing required environment variables:");
    missing.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }

  console.log("⚙️ Environment variables validated successfully");
};
