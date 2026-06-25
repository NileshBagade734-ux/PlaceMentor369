import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import Job from "./models/job.js";
import User from "./models/user.js";

dotenv.config();

const SEED_PASSWORD = process.env.SEED_PASSWORD || "Placementor@2026";

if (!process.env.SEED_PASSWORD) {
  console.warn(
    "⚠️  SEED_PASSWORD not set. Using default password. Set SEED_PASSWORD in .env for production."
  );
}

await mongoose.connect(process.env.MONGO_URI);

async function seed() {
  try {
    let recruiter = await User.findOne({ role: "recruiter" });

    if (!recruiter) {
      recruiter = await User.create({
        name: "Admin Recruiter",
        email: "recruiter@test.com",
        password: await bcrypt.hash(SEED_PASSWORD, 12),
        role: "recruiter"
      });
      console.log("✅ Seed user created: recruiter@test.com");
    }

    const job = await Job.create({
      title: "Software Engineer",
      company: "Google",
      description: "Develop cloud applications.",
      cgpa: 8.0,
      branch: ["Computer Science", "Information Technology"],
      skillsRequired: ["React", "Node.js", "JavaScript"],
      deadline: new Date("2026-12-31"),
      recruiter: recruiter._id,
      status: "approved"
    });

    console.log("✅ Job seeded successfully");
    console.log("🆔 Job ID:", job._id.toString());

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
