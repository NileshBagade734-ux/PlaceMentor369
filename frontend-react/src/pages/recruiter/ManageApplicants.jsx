import React from 'react';
import { Download } from 'lucide-react';

const ManageApplicants = () => {
  // Mock data for initial view
  const applicants = [
    {
      id: 1,
      name: 'John Doe',
      appliedFor: 'Software Engineer',
      cgpa: 8.5,
      status: 'Pending',
    },
    {
      id: 2,
      name: 'Jane Smith',
      appliedFor: 'Frontend Developer',
      cgpa: 9.1,
      status: 'Shortlisted',
    },
  ];

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Review Applications</h2>
          <p className="text-slate-500">Manage student applications and filter by eligibility</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow flex items-center justify-center gap-2 transition-colors">
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-max">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Student Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Applied For</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">CGPA</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Resume</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-800">{applicant.name}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-slate-700">{applicant.appliedFor}</div>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded font-semibold text-sm">
                    {applicant.cgpa}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">
                    View
                  </button>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      applicant.status === 'Shortlisted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {applicant.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded transition-colors">
                      Shortlist
                    </button>
                    <button className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applicants.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No applications found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageApplicants;
