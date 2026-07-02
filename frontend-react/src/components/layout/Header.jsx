import React from 'react';
import { LogOut } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
      <div className="text-slate-400 font-medium">Recruiter Portal</div>
      <div className="flex items-center gap-6 text-slate-600">
        <span className="text-sm font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
          Recruiter Mode
        </span>
        <button
          onClick={() => {
            // For now, redirect to original login
            window.location.href = '../../login.html';
          }}
          className="flex items-center gap-2 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
