/**
 * Validates student profile inputs for mandatory schema integrity
 * @param {Object} data
 * @returns {Object} { isValid: boolean, errors: Array<string> }
 */
export const validateStudentProfile = (data = {}) => {
  const errors = [];

  // CGPA check
  if (data.cgpa !== undefined && data.cgpa !== null && data.cgpa !== '') {
    const cgpaNum = Number(data.cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      errors.push('CGPA must be a valid number between 0.0 and 10.0');
    }
  }

  // Branch check
  if (data.branch && typeof data.branch !== 'string') {
    errors.push('Branch must be a valid text string');
  }

  // URL checks
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

  if (data.githubUrl && !urlRegex.test(data.githubUrl)) {
    errors.push('GitHub URL is invalid. Please enter a full valid URL');
  }

  if (data.linkedinUrl && !urlRegex.test(data.linkedinUrl)) {
    errors.push('LinkedIn URL is invalid. Please enter a full valid URL');
  }

  if (data.portfolioUrl && !urlRegex.test(data.portfolioUrl)) {
    errors.push('Portfolio URL is invalid. Please enter a full valid URL');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
