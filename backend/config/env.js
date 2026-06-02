import dotenv from "dotenv";

dotenv.config();

export const validateEnv = () => {
  const requiredEnvs = ["MONGO_URI", "JWT_SECRET", "PORT"];
  const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

  if (missingEnvs.length > 0) {
    console.error(
      `❌ Error: Missing required environment variables: ${missingEnvs.join(", ")}`
    );
    process.exit(1);
  }

  console.log("✅ Environment variables validated successfully.");
};
