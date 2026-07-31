/**
 * Converts array of placement objects into a sanitized CSV string format
 * @param {Array<Object>} data 
 * @param {Array<string>} fields 
 * @returns {string} CSV formatted text
 */
export const convertToCSV = (data = [], fields = []) => {
  if (!Array.isArray(data) || data.length === 0) {
    return fields.join(',') + '\n';
  }

  const keys = fields.length > 0 ? fields : Object.keys(data[0]);
  const header = keys.join(',');

  const rows = data.map(row => {
    return keys.map(key => {
      let val = row[key] !== undefined && row[key] !== null ? row[key] : '';
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      val = String(val).replace(/"/g, '""');
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val}"`;
      }
      return val;
    }).join(',');
  });

  return [header, ...rows].join('\n');
};

/**
 * Formats report payload for JSON/CSV download responses
 * @param {Object} reportPayload 
 * @param {string} format 'csv' | 'json'
 */
export const formatReportData = (reportPayload, format = 'json') => {
  if (format === 'csv') {
    const flattened = (reportPayload.placements || []).map(item => ({
      StudentName: item.studentName || 'N/A',
      Email: item.email || 'N/A',
      Branch: item.branch || 'N/A',
      CGPA: item.cgpa || 'N/A',
      Company: item.company || 'N/A',
      Role: item.role || 'N/A',
      PackageLPA: item.packageLPA || 0,
      Status: item.status || 'Placed',
      Date: item.date ? new Date(item.date).toISOString().split('T')[0] : ''
    }));

    return {
      contentType: 'text/csv',
      filename: `Placement_Report_${Date.now()}.csv`,
      data: convertToCSV(flattened, ['StudentName', 'Email', 'Branch', 'CGPA', 'Company', 'Role', 'PackageLPA', 'Status', 'Date'])
    };
  }

  return {
    contentType: 'application/json',
    filename: `Placement_Report_${Date.now()}.json`,
    data: JSON.stringify(reportPayload, null, 2)
  };
};
