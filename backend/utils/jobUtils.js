import Job from "../models/job.js";

// Check if a job posting deadline has passed and mark as expired
export const expireOutdatedJobs = async () => {
  try {
    const now = new Date();
    const result = await Job.updateMany(
      {
        deadline: { $lt: now },
        status: { $ne: "expired" }
      },
      {
        $set: { status: "expired" }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Expired ${result.modifiedCount} outdated job postings`);
    }

    return result;
  } catch (err) {
    console.error("Error expiring outdated jobs:", err);
  }
};

// Get active (non-expired) jobs
export const getActiveJobs = async (filter = {}) => {
  const now = new Date();
  return Job.find({
    ...filter,
    deadline: { $gte: now },
    status: "approved"
  });
};

// Validate job posting data
export const validateJobPosting = (jobData) => {
  const errors = [];

  if (!jobData.title || jobData.title.trim().length === 0) {
    errors.push("Job title is required");
  }

  if (!jobData.company || jobData.company.trim().length === 0) {
    errors.push("Company name is required");
  }

  if (!jobData.description || jobData.description.trim().length === 0) {
    errors.push("Job description is required");
  }

  if (!jobData.deadline) {
    errors.push("Application deadline is required");
  } else {
    const deadlineDate = new Date(jobData.deadline);
    if (deadlineDate <= new Date()) {
      errors.push("Application deadline must be in the future");
    }
  }

  if (jobData.salary) {
    const { min, max } = jobData.salary;
    if ((min || min === 0) && (max || max === 0)) {
      if (min < 0 || max < 0) {
        errors.push("Salary values must be non-negative");
      }
      if (max > 0 && min > max) {
        errors.push("Salary minimum must not exceed maximum");
      }
    }
  }

  return errors;
};
