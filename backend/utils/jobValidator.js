/**
 * Job Posting Validator
 * Validates job postings for accuracy and enforces business rules
 */

export const validateJobPosting = (jobData) => {
  const errors = [];
  const warnings = [];

  // Check deadline is in future
  if (new Date(jobData.deadline) <= new Date()) {
    errors.push("Deadline must be in the future");
  }

  // Check salary range validity
  if (jobData.salaryMin && jobData.salaryMax) {
    if (jobData.salaryMin < 0 || jobData.salaryMax < 0) {
      errors.push("Salary values cannot be negative");
    }
    if (jobData.salaryMin > jobData.salaryMax) {
      errors.push("Minimum salary cannot exceed maximum salary");
    }
    if (jobData.salaryMax > 200) {
      warnings.push("Salary exceeds typical market range (>200 LPA)");
    }
  }

  // Check CGPA requirement is valid
  if (jobData.cgpa && (jobData.cgpa < 0 || jobData.cgpa > 10)) {
    errors.push("CGPA requirement must be between 0 and 10");
  }

  // Check skills are not outdated (basic check)
  if (jobData.skillsRequired && jobData.skillsRequired.length > 0) {
    const outdatedSkills = ["COBOL", "Pascal", "Fortran", "BASIC"];
    const found = jobData.skillsRequired.filter(skill =>
      outdatedSkills.some(old => skill.toLowerCase().includes(old.toLowerCase()))
    );
    if (found.length > 0) {
      warnings.push(`Potentially outdated skills found: ${found.join(", ")}`);
    }
  }

  // Check description is detailed enough
  if (!jobData.description || jobData.description.trim().length < 50) {
    errors.push("Job description must be at least 50 characters");
  }

  // Check required fields
  const required = ["title", "company", "description", "deadline"];
  const missing = required.filter(field => !jobData[field]);
  if (missing.length > 0) {
    errors.push(`Missing required fields: ${missing.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validationStatus: errors.length > 0 ? "flagged" : "verified"
  };
};

export const checkJobExpiry = async (job) => {
  if (new Date(job.deadline) <= new Date()) {
    job.status = "expired";
    await job.save();
    return true;
  }
  return false;
};

export const addFeedback = (job, studentId, issue, message) => {
  job.feedback.push({
    studentId,
    issue,
    message,
    createdAt: new Date()
  });

  // Recalculate company accuracy score based on feedback
  const issues = job.feedback.length;
  const baseScore = 100;
  const penaltyPerIssue = 5;
  job.companyAccuracyScore = Math.max(0, baseScore - (issues * penaltyPerIssue));

  return job;
};

export const logAuditEntry = (job, action, changedBy, previousValue = null, newValue = null) => {
  job.auditLog.push({
    action,
    changedBy,
    previousValue,
    newValue,
    timestamp: new Date()
  });
  return job;
};
