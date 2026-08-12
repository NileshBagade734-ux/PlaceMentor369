import React from 'react';

/**
 * Reusable pulse skeleton loader for card placeholders
 */
export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6 mb-6"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-slate-200 rounded w-20"></div>
        <div className="h-8 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function SkeletonLoader({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

export default SkeletonLoader;
