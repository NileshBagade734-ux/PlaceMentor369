import React, { useState } from 'react';
import { Download, Search, Filter, CheckCircle2, XCircle, Users } from 'lucide-react';

const ManageApplicants = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [applicants, setApplicants] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', appliedFor: 'Software Engineer', cgpa: 8.5, status: 'Applied' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', appliedFor: 'Frontend Developer', cgpa: 9.1, status: 'Shortlisted' },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com', appliedFor: 'Data Analyst', cgpa: 7.8, status: 'Applied' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', appliedFor: 'Backend Developer', cgpa: 8.9, status: 'Rejected' },
  ]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredApplicants.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkUpdate = (newStatus) => {
    setApplicants((prev) =>
      prev.map((app) => (selectedIds.includes(app.id) ? { ...app, status: newStatus } : app))
    );
    setSelectedIds([]);
  };

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.appliedFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Review Applications</h2>
          <p className="text-slate-500">Manage student applications, apply bulk statuses, and filter by criteria</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow flex items-center justify-center gap-2 transition-colors">
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </header>

      {/* Filter and Bulk Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, role, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 w-full md:w-auto justify-between">
            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> {selectedIds.length} Selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkUpdate('Shortlisted')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded flex items-center gap-1 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Shortlist All
              </button>
              <button
                onClick={() => handleBulkUpdate('Rejected')}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded flex items-center gap-1 transition"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-max">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === filteredApplicants.length}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Student Candidate</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Applied For</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">CGPA</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredApplicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(applicant.id)}
                    onChange={() => handleSelectOne(applicant.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="p-4">
                  <div className="font-semibold text-slate-800">{applicant.name}</div>
                  <div className="text-xs text-slate-400">{applicant.email}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-slate-700">{applicant.appliedFor}</div>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded font-bold text-xs">
                    {applicant.cgpa}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      applicant.status === 'Shortlisted'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : applicant.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {applicant.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() =>
                        setApplicants(
                          applicants.map((a) => (a.id === applicant.id ? { ...a, status: 'Shortlisted' } : a))
                        )
                      }
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded transition-colors"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() =>
                        setApplicants(
                          applicants.map((a) => (a.id === applicant.id ? { ...a, status: 'Rejected' } : a))
                        )
                      }
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredApplicants.length === 0 && (
          <div className="p-12 text-center text-slate-400 font-medium">
            No matching candidate applications found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageApplicants;
