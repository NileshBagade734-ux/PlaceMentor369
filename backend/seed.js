import mongoose from "mongoose";
import Job from "./models/job.js"; // Path check kar lena
import dotenv from "dotenv";

dotenv.config();

const seedJobs = [
  {
    title: "Software Engineer",
    company: "Google",
    location: "Bangalore",
    description: "Cloud infrastructure development and scaling.",
    skillsRequired: ["React", "Node.js", "JavaScript"],
    cgpa: 8.0,
    branches: ["Computer Science", "Information Technology"],
    salary: "20 LPA"
  },
  {
    title: "Data Analyst",
    company: "Amazon",
    location: "Hyderabad",
    description: "Analyze large datasets and build predictive models.",
    skillsRequired: ["Python", "SQL", "Tableau"],
    cgpa: 7.5,
    branches: ["Computer Science", "Data Science"],
    salary: "15 LPA"
  }
];

const runSeed = async () => {
  try {
    // Apne MongoDB URL se connect karein
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/your_db_name");
    
    console.log("Database Connected...");

    // Purani dummy jobs delete karein
    await Job.deleteMany();
    console.log("Old jobs cleared.");

    // Nayi real jobs insert karein
    await Job.insertMany(seedJobs);
    console.log("Real jobs added successfully! ✅");

    process.exit();
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

runSeed();