import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, UserCheck, PlusCircle } from 'lucide-react';

const DashboardOverview = () => {
  const navigate = useNavigate();

  // In a real app, these would come from an API or state
  const stats = {
    jobsPosted: 0,
    totalApplicants: 0,
    shortlisted: 0,
  };

  const activeJobs = []; // Replace with actual data fetching

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
        <p className="text-slate-500">Track your hiring progress and active listings</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Jobs Posted
            </p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.jobsPosted}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Total Applicants
            </p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.totalApplicants}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Shortlisted
            </p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.shortlisted}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate('/recruiter/post-job')}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> Post New Job
        </button>
        <button
          onClick={() => navigate('/recruiter/manage-applicants')}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3 px-6 rounded-xl font-semibold shadow-sm transition-colors"
        >
          <Users className="w-5 h-5" /> View All Applicants
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">
          Active Job Postings
        </h3>
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-slate-600 font-medium mb-2">No active jobs</h4>
              <p className="text-slate-400 text-sm">Post a new job to start receiving applications</p>
            </div>
          ) : (
            activeJobs.map((job, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                {/* Render job details here */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
