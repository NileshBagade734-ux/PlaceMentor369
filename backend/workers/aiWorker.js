import { Worker } from 'bullmq';
import connection from '../config/redis.js';
import Student from '../models/student.js';
import { analyzeResume } from '../utils/gemini.js';

if (!connection) {
    console.warn("⚠️ Redis connection is missing. AI Worker will not start.");
} else {
    console.log("👷 Starting BullMQ Worker: ai-analysis-queue");

    const aiWorker = new Worker('ai-analysis-queue', async job => {
        const { userId, resumeText, base64Resume } = job.data;
        console.log(`[Job ${job.id}] Started processing AI resume analysis for user: ${userId}`);

        try {
            // 1. Call Gemini AI
            const aiResult = await analyzeResume(resumeText);
            console.log(`[Job ${job.id}] Gemini AI analysis completed`);

            // 2. Update Student Profile
            let student = await Student.findOne({ user: userId });
            if (!student) {
                student = new Student({ user: userId });
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
            student.resume = base64Resume;
            
            // Merge skills (unique)
            if (aiResult.skills && aiResult.skills.length > 0) {
                const mergedSkills = new Set([...student.skills, ...aiResult.skills]);
                student.skills = Array.from(mergedSkills);
            }

            student.aiReadinessScore = aiResult.aiReadinessScore || 0;
            student.aiRoadmap = aiResult.aiRoadmap || [];

            await student.save();
            console.log(`[Job ${job.id}] Student profile updated successfully in database.`);

            return { success: true, aiResult };
        } catch (error) {
            console.error(`[Job ${job.id}] Failed to process resume:`, error.message);
            throw error; // Will be caught by BullMQ and retried if configured
        }
    }, { connection });

    aiWorker.on('completed', job => {
        console.log(`✅ [Job ${job.id}] has completed!`);
    });

    aiWorker.on('failed', (job, err) => {
        console.error(`❌ [Job ${job.id}] has failed with ${err.message}`);
    });
}
