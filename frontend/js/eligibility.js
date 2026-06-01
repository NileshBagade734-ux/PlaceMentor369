// ============================
// Eligibility Utility
// ============================

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function checkEligibility(student, job) {
  const studentCGPA = Number(student.cgpa || 0);
  const minCGPA = Number(job.cgpa || 0);
  const studentBranch = normalizeText(student.branch || "");
  const eligibleBranches = Array.isArray(job.branches) ? job.branches : [];
  const normalizedBranches = eligibleBranches.map(normalizeText);
  const studentSkills = Array.isArray(student.skills)
    ? student.skills.map(normalizeText)
    : [];
  const jobSkills = Array.isArray(job.skills) ? job.skills.map(normalizeText) : [];

  const eligibleCGPA = studentCGPA >= minCGPA;
  const eligibleBranch = normalizedBranches.length === 0 || normalizedBranches.includes(studentBranch);

  const matchingSkills = jobSkills.filter((skill) => studentSkills.includes(skill));
  const skillMatchCount = matchingSkills.length;

  const reasons = [];
  if (!eligibleCGPA) {
    reasons.push(`Minimum CGPA required: ${minCGPA}`);
  }
  if (!eligibleBranch) {
    reasons.push("Branch not eligible");
  }

  return {
    eligible: eligibleCGPA && eligibleBranch,
    reasons,
    details: {
      eligibleCGPA,
      eligibleBranch,
      studentCGPA,
      minCGPA,
      studentBranch: student.branch || "N/A",
      eligibleBranches: eligibleBranches.length > 0 ? eligibleBranches : ["Any"],
      matchingSkills,
      totalSkills: jobSkills.length,
      studentSkills: student.skills || []
    }
  };
}
