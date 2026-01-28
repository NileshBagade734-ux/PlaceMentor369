// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import Job from "./models/Job.js";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

async function seed() {
  try {
    let recruiter = await User.findOne({ role: "recruiter" });

    if (!recruiter) {
      recruiter = await User.create({
        name: "Admin Recruiter",
        email: "recruiter@test.com",
        password: await bcrypt.hash("123456", 10),
        role: "recruiter"
      });
    }

 const job = await Job.create({
  title: "Software Engineer",
  company: "Google",
  description: "Develop cloud applications.",
  cgpa: 8.0,
  branch: ["Computer Science", "Information Technology"],
  skillsRequired: ["React", "Node.js", "JavaScript"],
  deadline: new Date("2026-02-28"),
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
