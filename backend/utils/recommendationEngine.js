/**
 * Calculates candidate compatibility score for a job posting.
 * Uses a weighted algorithm:
 * - Skill Overlap (60% weight)
 * - CGPA Eligibility (25% weight)
 * - Branch Alignment (15% weight)
 *
 * @param {Object} student 
 * @param {Object} job 
 * @returns {Object} { score: number, matchLevel: string, matchingSkills: string[], missingSkills: string[] }
 */
export const calculateJobMatch = (student = {}, job = {}) => {
  const studentSkills = (student.skills || []).map(s => s.toLowerCase().trim());
  const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase().trim());

  const matchingSkills = [];
  const missingSkills = [];

  jobSkills.forEach(skill => {
    if (studentSkills.includes(skill)) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // 1. Skill Score (Jaccard-like ratio)
  const skillRatio = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) : 1;
  const skillScore = skillRatio * 60;

  // 2. CGPA Score
  const studentCGPA = Number(student.cgpa) || 0;
  const reqCGPA = Number(job.minCGPA) || 0;
  let cgpaScore = 0;

  if (studentCGPA >= reqCGPA) {
    const cgpaDiff = Math.min(2, studentCGPA - reqCGPA);
    cgpaScore = 20 + (cgpaDiff * 2.5); // Max 25
  } else {
    cgpaScore = Math.max(0, 20 - (reqCGPA - studentCGPA) * 10);
  }

  // 3. Branch Score
  const studentBranch = (student.branch || '').toLowerCase().trim();
  const eligibleBranches = (job.eligibleBranches || []).map(b => b.toLowerCase().trim());
  let branchScore = 15;

  if (eligibleBranches.length > 0 && !eligibleBranches.includes('all') && !eligibleBranches.includes(studentBranch)) {
    branchScore = 5;
  }

  const totalScore = Math.min(100, Math.round(skillScore + cgpaScore + branchScore));

  let matchLevel = 'Low';
  if (totalScore >= 80) matchLevel = 'Exceptional';
  else if (totalScore >= 65) matchLevel = 'High';
  else if (totalScore >= 45) matchLevel = 'Moderate';

  return {
    score: totalScore,
    matchLevel,
    matchingSkills,
    missingSkills
  };
};

/**
 * Ranks list of jobs according to candidate profile match
 */
export const rankJobsForStudent = (student, jobs = []) => {
  return jobs.map(job => {
    const match = calculateJobMatch(student, job);
    return {
      ...job,
      matchScore: match.score,
      matchLevel: match.matchLevel,
      matchingSkills: match.matchingSkills,
      missingSkills: match.missingSkills
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};
