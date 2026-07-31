/**
 * Filters applicant list by multi-attribute parameters
 * @param {Array<Object>} applicants 
 * @param {Object} filters { status, minCgpa, branch, search }
 */
export const filterApplicants = (applicants = [], filters = {}) => {
  const { status, minCgpa, branch, search } = filters;

  return applicants.filter(app => {
    // 1. Status Filter
    if (status && status !== 'all' && app.status !== status) {
      return false;
    }

    const student = app.student || {};

    // 2. Minimum CGPA Filter
    if (minCgpa && Number(student.cgpa || 0) < Number(minCgpa)) {
      return false;
    }

    // 3. Branch Filter
    if (branch && branch !== 'all' && (student.branch || '').toLowerCase() !== branch.toLowerCase()) {
      return false;
    }

    // 4. Keyword Search (Name / Email / Skills)
    if (search && search.trim() !== '') {
      const query = search.toLowerCase().trim();
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
      const email = (student.email || '').toLowerCase();
      const skills = (student.skills || []).join(' ').toLowerCase();

      if (!fullName.includes(query) && !email.includes(query) && !skills.includes(query)) {
        return false;
      }
    }

    return true;
  });
};
