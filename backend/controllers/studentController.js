import mongoose from "mongoose";
import Student from "../models/student.js";
import Job from "../models/job.js";
import Application from "../models/application.js"; // make sure file name matches exactly
import { analyzeResume } from "../utils/gemini.js";
import { PDFParse } from "pdf-parse";

/* ============================
   GET STUDENT PROFILE
============================ */
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    res.status(200).json(student || {});
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================
   SAVE/UPDATE STUDENT PROFILE
============================ */
export const saveProfile = async (req, res) => {
  try {
    const { name, roll, branch, cgpa, college, skills, resume } = req.body;

    let student = await Student.findOne({ user: req.user.id });
    if (!student) student = new Student({ user: req.user.id });

    student.name = name || "";
    student.roll = roll || "";
    student.branch = branch || "";
    student.cgpa = cgpa || 0;
    student.college = college || "";
    student.skills = skills || [];
    student.resume = resume || "";

    await student.save();
    res.status(200).json({ message: "Profile saved successfully", student });
  } catch (err) {
    console.error("SAVE PROFILE ERROR:", err);
    res.status(500).json({ message: "Save failed" });
  }
};

/* ============================
   GET ALL APPROVED JOBS
============================ */
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "approved" });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/* ============================
   APPLY FOR JOB
============================ */
export const applyJob = async (req, res) => {
  try {
    console.log("🆔 req.user:", req.user);
    console.log("🆔 req.params.jobId:", req.params.jobId);

    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const job = await Job.findById(jobId);
    console.log("🧰 job found:", job);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const studentProfile = await Student.findOne({ user: req.user.id });
    console.log("🧰 studentProfile found:", studentProfile);
    if (!studentProfile) {
      return res.status(400).json({ message: "Complete your profile first" });
    }

    // ✅ Check if already applied
    const exists = await Application.findOne({
      student: studentProfile._id,
      job: jobId
    });
    console.log("🧰 existing application:", exists);
    if (exists) return res.status(400).json({ message: "Already applied" });

    // ✅ Create new application
    const application = await Application.create({
      student: studentProfile._id,
      job: jobId
    });
    console.log("🧰 application created:", application);

    // ⚡ UPDATE JOB DOCUMENT: push application ID
    // TODO: e.g. await Job.findByIdAndUpdate(jobId, { $push: { applications: application._id } });

    res.status(201).json({
      success: true,
      message: "Application sent successfully",
      application
    });

  } catch (err) {
    console.error("🔥 APPLY JOB ERROR:", err);
    res.status(500).json({ message: "Failed to apply" });
  }
};

/* ============================
   GET STUDENT APPLICATIONS
============================ */
export const getApplications = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user.id });
    if (!studentProfile) return res.status(200).json([]);

    const apps = await Application.find({ student: studentProfile._id }).populate({
      path: "job",
      select: "title company"
    });

    res.status(200).json(apps);
  } catch (err) {
    console.error("GET APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* ============================
   GET JOB APPLICATIONS FOR RECRUITER
============================ */
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId }).populate({
      path: "student",
      select: "name email branch cgpa resume"
    });

    res.status(200).json(applications);
  } catch (err) {
    console.error("GET JOB APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* ============================
   SKILL GAP ANALYSIS
============================ */

// Curated learning resource map: skill → { platform, url, type }
const LEARNING_RESOURCES = {
  "javascript": { platform: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", type: "Free Course" },
  "typescript": { platform: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "Documentation" },
  "python": { platform: "Python.org", url: "https://docs.python.org/3/tutorial/", type: "Official Tutorial" },
  "java": { platform: "Codecademy", url: "https://www.codecademy.com/learn/learn-java", type: "Free Course" },
  "c++": { platform: "LearnCpp", url: "https://www.learncpp.com/", type: "Free Course" },
  "c": { platform: "LearnCpp", url: "https://www.learn-c.org/", type: "Free Course" },
  "react": { platform: "React Docs", url: "https://react.dev/learn", type: "Official Docs" },
  "angular": { platform: "Angular Docs", url: "https://angular.io/start", type: "Official Docs" },
  "vue": { platform: "Vue Docs", url: "https://vuejs.org/guide/introduction.html", type: "Official Docs" },
  "node.js": { platform: "Node.js Docs", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", type: "Official Docs" },
  "nodejs": { platform: "Node.js Docs", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", type: "Official Docs" },
  "express": { platform: "Express Docs", url: "https://expressjs.com/en/starter/hello-world.html", type: "Official Docs" },
  "mongodb": { platform: "MongoDB University", url: "https://learn.mongodb.com/", type: "Free Course" },
  "mysql": { platform: "MySQL Tutorial", url: "https://www.mysqltutorial.org/", type: "Free Tutorial" },
  "postgresql": { platform: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "Free Tutorial" },
  "sql": { platform: "SQLZoo", url: "https://sqlzoo.net/", type: "Interactive" },
  "git": { platform: "GitHub Skills", url: "https://skills.github.com/", type: "Free Course" },
  "docker": { platform: "Docker Docs", url: "https://docs.docker.com/get-started/", type: "Official Docs" },
  "kubernetes": { platform: "Kubernetes Docs", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", type: "Official Docs" },
  "aws": { platform: "AWS Skill Builder", url: "https://skillbuilder.aws/", type: "Free Course" },
  "azure": { platform: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/training/azure/", type: "Free Course" },
  "gcp": { platform: "Google Cloud Skills Boost", url: "https://www.cloudskillsboost.google/", type: "Free Course" },
  "machine learning": { platform: "Coursera (Andrew Ng)", url: "https://www.coursera.org/specializations/machine-learning-introduction", type: "Course" },
  "deep learning": { platform: "fast.ai", url: "https://www.fast.ai/", type: "Free Course" },
  "data science": { platform: "Kaggle", url: "https://www.kaggle.com/learn", type: "Free Course" },
  "data structures": { platform: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/data-structures/", type: "Free Tutorial" },
  "algorithms": { platform: "LeetCode", url: "https://leetcode.com/explore/", type: "Interactive" },
  "system design": { platform: "Grokking System Design", url: "https://www.educative.io/courses/grokking-the-system-design-interview", type: "Course" },
  "rest api": { platform: "REST API Tutorial", url: "https://restfulapi.net/", type: "Free Tutorial" },
  "graphql": { platform: "GraphQL Docs", url: "https://graphql.org/learn/", type: "Official Docs" },
  "django": { platform: "Django Docs", url: "https://docs.djangoproject.com/en/stable/intro/tutorial01/", type: "Official Docs" },
  "flask": { platform: "Flask Docs", url: "https://flask.palletsprojects.com/en/stable/quickstart/", type: "Official Docs" },
  "spring boot": { platform: "Spring Guides", url: "https://spring.io/guides", type: "Official Docs" },
  "linux": { platform: "Linux Foundation", url: "https://training.linuxfoundation.org/resources/free-courses/", type: "Free Course" },
  "html": { platform: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "Free Tutorial" },
  "css": { platform: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS", type: "Free Tutorial" },
  "tailwind": { platform: "Tailwind Docs", url: "https://tailwindcss.com/docs/utility-first", type: "Official Docs" },
  "figma": { platform: "Figma Academy", url: "https://www.figma.com/resources/learn-design/", type: "Free Course" },
  "devops": { platform: "DevOps Roadmap", url: "https://roadmap.sh/devops", type: "Roadmap" },
  "testing": { platform: "Testing Library Docs", url: "https://testing-library.com/docs/", type: "Official Docs" },
  "jest": { platform: "Jest Docs", url: "https://jestjs.io/docs/getting-started", type: "Official Docs" },
  "go": { platform: "Go Tour", url: "https://go.dev/tour/welcome/1", type: "Official Tutorial" },
  "rust": { platform: "The Rust Book", url: "https://doc.rust-lang.org/book/", type: "Free Book" },
  "kotlin": { platform: "Kotlin Docs", url: "https://kotlinlang.org/docs/getting-started.html", type: "Official Docs" },
  "swift": { platform: "Swift Docs", url: "https://www.swift.org/getting-started/", type: "Official Docs" },
  "flutter": { platform: "Flutter Docs", url: "https://docs.flutter.dev/get-started/codelab", type: "Official Docs" },
  "react native": { platform: "React Native Docs", url: "https://reactnative.dev/docs/getting-started", type: "Official Docs" },
  "android": { platform: "Android Developers", url: "https://developer.android.com/courses", type: "Free Course" },
  "ios": { platform: "Apple Developer", url: "https://developer.apple.com/tutorials/app-dev-training", type: "Official Tutorial" },
  "pandas": { platform: "Pandas Docs", url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/", type: "Official Docs" },
  "numpy": { platform: "NumPy Docs", url: "https://numpy.org/learn/", type: "Official Docs" },
  "tensorflow": { platform: "TensorFlow Tutorials", url: "https://www.tensorflow.org/tutorials", type: "Official Docs" },
  "pytorch": { platform: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/", type: "Official Docs" },
  "blockchain": { platform: "CryptoZombies", url: "https://cryptozombies.io/", type: "Interactive" },
  "cybersecurity": { platform: "TryHackMe", url: "https://tryhackme.com/", type: "Interactive" },
  "networking": { platform: "Cisco NetAcad", url: "https://www.netacad.com/courses/networking", type: "Free Course" },
  "agile": { platform: "Atlassian Agile", url: "https://www.atlassian.com/agile", type: "Free Guide" },
  "scrum": { platform: "Scrum.org", url: "https://www.scrum.org/resources/what-is-scrum", type: "Free Guide" },
};

// Determine readiness tier based on match score
function getReadinessTier(score) {
  if (score >= 85) return { label: "Job Ready", color: "green", icon: "🟢", advice: "You're well-prepared for this role. Polish your resume and apply with confidence." };
  if (score >= 65) return { label: "Almost Ready", color: "blue", icon: "🔵", advice: "You meet the core requirements. Close the skill gaps below to maximise your chances." };
  if (score >= 40) return { label: "Developing", color: "yellow", icon: "🟡", advice: "You have a foundation but need to build more skills. Focus on the top missing skills first." };
  return { label: "Needs Work", color: "red", icon: "🔴", advice: "Significant preparation is needed. Use the learning recommendations to start your journey." };
}

export const getSkillGapAnalysis = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const [job, studentProfile] = await Promise.all([
      Job.findById(jobId),
      Student.findOne({ user: req.user.id })
    ]);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!studentProfile) return res.status(400).json({ message: "Complete your profile first" });

    const normalize = (s) => String(s || "").trim().toLowerCase();

    const studentSkills = (studentProfile.skills || []).map(normalize);
    const requiredSkills = (job.skillsRequired || []);
    const requiredNormalized = requiredSkills.map(normalize);

    const totalRequired = requiredNormalized.length;

    // Identify matched and missing skills
    const matchedSkills = requiredSkills.filter((s) => studentSkills.includes(normalize(s)));
    const missingSkills = requiredSkills.filter((s) => !studentSkills.includes(normalize(s)));

    // Compute score:
    // - 60% weight from skill match (if job has required skills)
    // - 20% weight from CGPA eligibility
    // - 20% weight from branch eligibility
    let skillScore = 0;
    if (totalRequired > 0) {
      skillScore = (matchedSkills.length / totalRequired) * 60;
    } else {
      skillScore = 60; // full skill points if job has no required skills listed
    }

    const cgpaScore = (studentProfile.cgpa || 0) >= (job.cgpa || 0) ? 20 : 10;
    const eligibleBranches = (job.branch || []).map(normalize);
    const branchScore = eligibleBranches.length === 0 || eligibleBranches.includes(normalize(studentProfile.branch)) ? 20 : 5;

    const matchScore = Math.round(skillScore + cgpaScore + branchScore);

    // Build learning recommendations for missing skills
    const recommendations = missingSkills.map((skill) => {
      const key = normalize(skill);
      const resource = LEARNING_RESOURCES[key] || {
        platform: "Google",
        url: `https://www.google.com/search?q=${encodeURIComponent(skill + " tutorial for beginners")}`,
        type: "Search"
      };
      return {
        skill,
        platform: resource.platform,
        url: resource.url,
        type: resource.type
      };
    });

    // Readiness indicator
    const readiness = getReadinessTier(matchScore);

    res.status(200).json({
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        requiredSkills,
        minCGPA: job.cgpa || 0,
        branches: job.branch || []
      },
      student: {
        name: studentProfile.name,
        branch: studentProfile.branch,
        cgpa: studentProfile.cgpa,
        skills: studentProfile.skills || []
      },
      analysis: {
        matchScore,
        matchedSkills,
        missingSkills,
        totalRequired,
        cgpaMet: studentProfile.cgpa >= (job.cgpa || 0),
        branchEligible: eligibleBranches.length === 0 || eligibleBranches.includes(normalize(studentProfile.branch)),
        readiness,
        recommendations
      }
    });

  } catch (err) {
    console.error("SKILL GAP ANALYSIS ERROR:", err);
    res.status(500).json({ message: "Failed to compute skill gap analysis" });
  }
};

/* ============================
   UPLOAD RESUME & AI PARSE (Phase 1 & 2)
============================ */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    // 1. Extract text from PDF
    const parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    const resumeText = result.text;

    // 2. Call Gemini AI
    const aiResult = await analyzeResume(resumeText);

    // 3. Update Student Profile
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = new Student({ user: req.user.id });
    }

    // Auto-Onboarding
    if (aiResult.firstName || aiResult.lastName) {
      student.name = `${aiResult.firstName || ""} ${aiResult.lastName || ""}`.trim();
    }
    if (aiResult.roll) student.roll = aiResult.roll;
    if (aiResult.college) student.college = aiResult.college;
    if (aiResult.branch) student.branch = aiResult.branch;
    if (aiResult.cgpa !== undefined && aiResult.cgpa !== null) student.cgpa = aiResult.cgpa;

    // Direct persistence of the uploaded PDF file as base64
    student.resume = `data:application/pdf;base64,${req.file.buffer.toString("base64")}`;

    // Merge skills (unique)
    if (aiResult.skills && aiResult.skills.length > 0) {
       const mergedSkills = new Set([...student.skills, ...aiResult.skills]);
       student.skills = Array.from(mergedSkills);
    }

    student.aiReadinessScore = aiResult.aiReadinessScore || 0;
    student.aiRoadmap = aiResult.aiRoadmap || [];

    await student.save();

    res.status(200).json({
      message: "Resume parsed and profile updated successfully via AI",
      student: {
        ...student.toObject(),
        firstName: aiResult.firstName || "",
        lastName: aiResult.lastName || ""
      }
    });

  } catch (err) {
    console.error("UPLOAD RESUME ERROR:", err);
    res.status(500).json({ message: err.message || "Failed to process resume" });
  }
};