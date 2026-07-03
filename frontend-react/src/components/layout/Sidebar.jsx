import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:block">
      <h1 className="text-xl font-bold text-indigo-600 mb-10">PlacementorAI</h1>
      <nav className="space-y-2">
        <NavLink
          to="/recruiter"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/recruiter/post-job"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <PlusCircle className="w-5 h-5" />
          <span>Post Job</span>
        </NavLink>

        <NavLink
          to="/recruiter/manage-applicants"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Manage Applicants</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
