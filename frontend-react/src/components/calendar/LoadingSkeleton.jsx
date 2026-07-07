const LoadingSkeleton = () => {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200/70" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-3xl bg-slate-200/70" />
          ))}
        </div>
      </div>
      <div className="h-[600px] animate-pulse rounded-3xl bg-slate-200/70" />
    </div>
  );
};

export default LoadingSkeleton;