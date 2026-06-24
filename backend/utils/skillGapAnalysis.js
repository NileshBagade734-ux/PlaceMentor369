/**
 * Utility: skillGapAnalysis.js
 * Compares student skills vs job required skills.
 *
 * Both student.skills and job.skillsRequired are arrays of strings.
 * Comparison is case-insensitive and trimmed.
 */

/**
 * Normalize a skill string for comparison.
 * e.g. "  React.js " → "react.js"
 */
const normalize = (skill) => skill.trim().toLowerCase();

/**
 * getDetailedSkillGap(student, job)
 *
 * Compares one student against one job.
 *
 * @param {Object} student - Student document (has skills: [String])
 * @param {Object} job     - Job document (has skillsRequired: [String], title, company)
 *
 * @returns {Object} {
 *   studentCurrentSkills,  // original casing from student
 *   jobRequiredSkills,     // original casing from job
 *   matchedSkills,         // skills student HAS that job needs
 *   missingSkills,         // skills job needs that student DOESN'T have
 *   matchPercentage,       // 0-100
 *   metrics: { total, matched, missing }
 * }
 */
export const getDetailedSkillGap = (student, job) => {
  const studentSkills = student.skills || [];
  const jobSkills = job.skillsRequired || [];

  // Normalized sets for comparison
  const studentNormalized = new Set(studentSkills.map(normalize));

  const matchedSkills = [];
  const missingSkills = [];

  jobSkills.forEach((skill) => {
    if (studentNormalized.has(normalize(skill))) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const total = jobSkills.length;
  const matched = matchedSkills.length;
  const matchPercentage =
    total === 0 ? 100 : Math.round((matched / total) * 100);

  return {
    studentCurrentSkills: studentSkills,
    jobRequiredSkills: jobSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
    metrics: {
      total,
      matched,
      missing: missingSkills.length,
    },
  };
};

/**
 * getAggregateSkillGaps(student, jobs)
 *
 * Runs getDetailedSkillGap across multiple jobs and aggregates results.
 * Useful for "learning path" — which skills appear most often as missing.
 *
 * @param {Object}   student - Student document
 * @param {Object[]} jobs    - Array of Job documents
 *
 * @returns {Object} {
 *   totalJobsAnalyzed,
 *   averageMatchPercentage,
 *   topMissingSkills,   // [{ skill, frequencyInJobs, percentage }] sorted by frequency
 *   jobGaps             // per-job breakdown
 * }
 */
export const getAggregateSkillGaps = (student, jobs) => {
  if (!jobs || jobs.length === 0) {
    return {
      totalJobsAnalyzed: 0,
      averageMatchPercentage: 0,
      topMissingSkills: [],
      jobGaps: [],
    };
  }

  const skillFrequency = {}; // normalized skill → count of jobs where it's missing
  const skillOriginalCase = {}; // normalized → original casing (first seen)
  const jobGaps = [];
  let totalMatchPercentage = 0;

  jobs.forEach((job) => {
    const gap = getDetailedSkillGap(student, job);
    totalMatchPercentage += gap.matchPercentage;

    jobGaps.push({
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      matchedSkills: gap.matchedSkills,
      missingSkills: gap.missingSkills,
      matchPercentage: gap.matchPercentage,
      metrics: gap.metrics,
    });

    // Count how many jobs each missing skill appears in
    gap.missingSkills.forEach((skill) => {
      const key = normalize(skill);
      skillFrequency[key] = (skillFrequency[key] || 0) + 1;
      if (!skillOriginalCase[key]) skillOriginalCase[key] = skill;
    });
  });

  const totalJobsAnalyzed = jobs.length;
  const averageMatchPercentage = Math.round(
    totalMatchPercentage / totalJobsAnalyzed
  );

  // Sort missing skills by how frequently they appear across jobs
  const topMissingSkills = Object.entries(skillFrequency)
    .map(([key, count]) => ({
      skill: skillOriginalCase[key],
      frequencyInJobs: count,
      percentage: Math.round((count / totalJobsAnalyzed) * 100),
    }))
    .sort((a, b) => b.frequencyInJobs - a.frequencyInJobs);

  return {
    totalJobsAnalyzed,
    averageMatchPercentage,
    topMissingSkills,
    jobGaps,
  };
};