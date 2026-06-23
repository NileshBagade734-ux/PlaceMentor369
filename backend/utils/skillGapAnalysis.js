// Compares a student's skills against a job's required skills and
// returns the matched/missing skills plus a percentage match score.

function normalizeSkills(skills = []) {
  return skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
}

/**
 * Detailed skill gap between a single student and a single job.
 */
export function getDetailedSkillGap(student, job) {
  const studentSkillsRaw = student.skills || [];
  const jobSkillsRaw = job.skillsRequired || [];

  const studentSkills = normalizeSkills(studentSkillsRaw);
  const jobSkills = normalizeSkills(jobSkillsRaw);

  const matchedSkills = jobSkillsRaw.filter((skill) =>
    studentSkills.includes(String(skill).trim().toLowerCase()),
  );

  const missingSkills = jobSkillsRaw.filter(
    (skill) => !studentSkills.includes(String(skill).trim().toLowerCase()),
  );

  const matchPercentage =
    jobSkills.length > 0
      ? Math.round((matchedSkills.length / jobSkills.length) * 100)
      : 100;

  return {
    studentCurrentSkills: studentSkillsRaw,
    jobRequiredSkills: jobSkillsRaw,
    matchedSkills,
    missingSkills,
    matchPercentage,
    metrics: {
      totalRequired: jobSkills.length,
      totalMatched: matchedSkills.length,
      totalMissing: missingSkills.length,
    },
  };
}

/**
 * Aggregate skill gap across many approved jobs — used to recommend
 * which skills a student should prioritize learning.
 */
export function getAggregateSkillGaps(student, jobs) {
  const jobGaps = jobs.map((job) => {
    const gap = getDetailedSkillGap(student, job);
    return {
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      missingSkills: gap.missingSkills,
      matchPercentage: gap.matchPercentage,
    };
  });

  // Count how often each missing skill appears across all jobs.
  const skillFrequency = {};
  jobGaps.forEach((gap) => {
    gap.missingSkills.forEach((skill) => {
      const key = String(skill).trim().toLowerCase();
      if (!skillFrequency[key]) {
        skillFrequency[key] = { skill, frequencyInJobs: 0 };
      }
      skillFrequency[key].frequencyInJobs += 1;
    });
  });

  const topMissingSkills = Object.values(skillFrequency).sort(
    (a, b) => b.frequencyInJobs - a.frequencyInJobs,
  );

  const averageMatchPercentage =
    jobGaps.length > 0
      ? Math.round(
          jobGaps.reduce((sum, g) => sum + g.matchPercentage, 0) / jobGaps.length,
        )
      : 0;

  return {
    totalJobsAnalyzed: jobGaps.length,
    averageMatchPercentage,
    topMissingSkills,
    jobGaps,
  };
}
