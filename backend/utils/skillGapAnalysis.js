function normalizeSkill(value) {
  return String(value || "").trim().toLowerCase();
}

function dedupeSkills(skills) {
  return Array.from(new Set((skills || []).map(normalizeSkill).filter(Boolean)));
}

function getBranchScore(studentBranch, jobBranches) {
  const normalizedBranches = dedupeSkills(jobBranches);
  if (normalizedBranches.length === 0) {
    return 20;
  }

  return normalizedBranches.includes(normalizeSkill(studentBranch)) ? 20 : 5;
}

function getCgpaScore(studentCgpa, jobCgpa) {
  return (Number(studentCgpa) || 0) >= (Number(jobCgpa) || 0) ? 20 : 10;
}

export function getDetailedSkillGap(student, job) {
  const studentCurrentSkills = dedupeSkills(student?.skills);
  const jobRequiredSkills = (job?.skillsRequired || []).map((skill) => String(skill || "").trim());
  const requiredNormalized = jobRequiredSkills.map(normalizeSkill);

  const matchedSkills = jobRequiredSkills.filter((skill) =>
    studentCurrentSkills.includes(normalizeSkill(skill))
  );

  const missingSkills = jobRequiredSkills.filter(
    (skill) => !studentCurrentSkills.includes(normalizeSkill(skill))
  );

  const totalRequired = jobRequiredSkills.length;
  const skillScore = totalRequired > 0 ? (matchedSkills.length / totalRequired) * 60 : 60;
  const cgpaScore = getCgpaScore(student?.cgpa, job?.cgpa);
  const branchScore = getBranchScore(student?.branch, job?.branch);

  const matchPercentage = Math.max(
    0,
    Math.min(100, Math.round(skillScore + cgpaScore + branchScore))
  );

  return {
    studentCurrentSkills,
    jobRequiredSkills,
    matchedSkills,
    missingSkills,
    metrics: {
      skillScore: Math.round(skillScore),
      cgpaScore,
      branchScore,
      totalScore: matchPercentage
    },
    matchPercentage
  };
}

export function getAggregateSkillGaps(student, jobs) {
  const jobList = Array.isArray(jobs) ? jobs : [];
  const jobGaps = jobList.map((job) => ({
    jobId: job._id,
    jobTitle: job.title,
    company: job.company,
    ...getDetailedSkillGap(student, job)
  }));

  const skillFrequency = new Map();
  for (const gap of jobGaps) {
    for (const skill of gap.missingSkills) {
      const key = String(skill || "").trim();
      if (!key) continue;
      skillFrequency.set(key, (skillFrequency.get(key) || 0) + 1);
    }
  }

  const topMissingSkills = Array.from(skillFrequency.entries())
    .map(([skill, frequencyInJobs]) => ({ skill, frequencyInJobs }))
    .sort((a, b) => {
      if (b.frequencyInJobs !== a.frequencyInJobs) {
        return b.frequencyInJobs - a.frequencyInJobs;
      }
      return a.skill.localeCompare(b.skill);
    });

  const averageMatchPercentage = jobGaps.length
    ? Math.round(
        jobGaps.reduce((sum, gap) => sum + gap.matchPercentage, 0) / jobGaps.length
      )
    : 0;

  return {
    totalJobsAnalyzed: jobGaps.length,
    averageMatchPercentage,
    topMissingSkills,
    jobGaps
  };
}