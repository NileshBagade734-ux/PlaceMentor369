import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const RecruiterLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="bg-indigo-900 text-indigo-100 text-xs px-8 py-2 flex justify-between items-center shadow-inner">
          <span className="font-semibold flex items-center gap-2">
            ⚡ Placement Pipeline Active • Automated screening & candidate filtering enabled
          </span>
          <span className="bg-indigo-800 text-indigo-200 px-2.5 py-0.5 rounded-full font-bold">Recruiter Portal v2.4</span>
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
