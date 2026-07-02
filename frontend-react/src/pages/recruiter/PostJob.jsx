import React, { useState } from 'react';

const PostJob = () => {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const branches = ['CSE', 'ISE', 'ECE', 'MECH', 'CIVIL', 'EEE'];
  const [selectedBranches, setSelectedBranches] = useState([]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const toggleBranch = (branch) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, send data to API
    alert('Job Posted Successfully!');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Post New Job</h1>
        <p className="text-slate-500">Create a new opportunity for students to apply</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">
            Job Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                placeholder="e.g. Software Development Engineer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                placeholder="e.g. TechCorp India"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Job Description
              </label>
              <textarea
                rows="5"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                placeholder="Roles, responsibilities, and perks..."
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">
            Eligibility & Skills
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Eligible Branches
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {branches.map((branch) => (
                  <label
                    key={branch}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBranches.includes(branch)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedBranches.includes(branch)}
                      onChange={() => toggleBranch(branch)}
                    />
                    <span
                      className={`text-sm font-medium ${
                        selectedBranches.includes(branch) ? 'text-indigo-700' : 'text-slate-700'
                      }`}
                    >
                      {branch}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Minimum CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                  placeholder="7.5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Required Skills
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                  placeholder="e.g. React, Python"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((s) => s !== skill))}
                      className="hover:text-indigo-900 focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-sm transition-colors"
        >
          Post Job Opportunity
        </button>
      </form>
    </div>
  );
};

export default PostJob;
