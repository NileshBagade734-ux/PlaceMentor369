// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import Job from "./models/job.js";
import User from "./models/user.js";

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

    // Clean up existing jobs
    await Job.deleteMany({});
    console.log("🗑️ Cleaned up existing jobs.");

    const seedJobs = [
      {
        title: "Software Development Engineer",
        company: "Google",
        description: "Join our core infrastructure team to design, build, and deploy massive-scale cloud applications. You will work on distributed database systems, Kubernetes orchestrations, and high-performance microservices.",
        cgpa: 8.5,
        branch: ["Computer Science", "Information Technology"],
        skillsRequired: ["React", "Node.js", "Go", "Kubernetes"],
        location: "Bangalore, India",
        salary: "₹24 LPA",
        employmentType: "Full-Time",
        recruiter: recruiter._id,
        status: "approved",
        deadline: new Date("2026-10-31")
      },
      {
        title: "Frontend Engineer Intern",
        company: "Meta",
        description: "We are looking for a creative Frontend Engineer Intern who is passionate about user experience. You will collaborate with product designers to implement new features using modern React, Tailwind CSS, and state management frameworks.",
        cgpa: 8.0,
        branch: ["Computer Science", "Information Technology", "Electronics and Communication"],
        skillsRequired: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
        location: "Remote",
        salary: "₹80,000 / month",
        employmentType: "Internship",
        recruiter: recruiter._id,
        status: "approved",
        deadline: new Date("2026-09-15")
      },
      {
        title: "Data Analyst",
        company: "Amazon",
        description: "Use advanced statistical methods, data warehousing, and business intelligence tools to extract insights from massive customer datasets. You will build dashboards and automate reports to drive strategic decisions.",
        cgpa: 7.5,
        branch: ["Computer Science", "Information Technology", "Data Science", "Mathematics"],
        skillsRequired: ["Python", "SQL", "Tableau", "Excel"],
        location: "Hyderabad, India",
        salary: "₹14 LPA",
        employmentType: "Full-Time",
        recruiter: recruiter._id,
        status: "approved",
        deadline: new Date("2026-11-15")
      },
      {
        title: "Full Stack Developer Intern",
        company: "Netflix",
        description: "Netflix is seeking a Full Stack Developer Intern to work with our streaming platform engineering group. You will contribute to backend Node.js APIs and integrate them with high-fidelity React frontend components.",
        cgpa: 8.2,
        branch: ["Computer Science", "Information Technology"],
        skillsRequired: ["React", "Node.js", "Express", "MongoDB", "Redux"],
        location: "Los Gatos, USA (Hybrid)",
        salary: "$8,000 / month",
        employmentType: "Internship",
        recruiter: recruiter._id,
        status: "approved",
        deadline: new Date("2026-08-30")
      },
      {
        title: "Cybersecurity Analyst",
        company: "Microsoft",
        description: "Help secure our next-generation cloud infrastructure. In this role, you will perform penetration tests, analyze vulnerability reports, monitor security logs, and collaborate on building secure identity management layers.",
        cgpa: 7.8,
        branch: ["Computer Science", "Information Technology", "Cyber Security"],
        skillsRequired: ["Python", "Linux", "Wireshark", "Docker"],
        location: "Pune, India",
        salary: "₹18 LPA",
        employmentType: "Full-Time",
        recruiter: recruiter._id,
        status: "approved",
        deadline: new Date("2026-12-05")
      },
      {
        title: "AI Research Engineer",
        company: "OpenAI",
        description: "Contribute to training and optimizing large language models. You will design neural architectures, scale distributed PyTorch trainers, and help align models for production use cases.",
        cgpa: 9.0,
        branch: ["Computer Science", "Data Science", "Mathematics"],
        skillsRequired: ["Python", "PyTorch", "Transformers", "Machine Learning"],
        location: "San Francisco, USA",
        salary: "$180,000 / year",
        employmentType: "Full-Time",
        recruiter: recruiter._id,
        status: "approved",
        deadline: new Date("2026-07-20")
      }
    ];

    const seeded = await Job.insertMany(seedJobs);
    console.log(`✅ Seeded ${seeded.length} jobs successfully.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
