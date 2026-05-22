import React from 'react';

export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return <div className={`skeleton ${width} ${height}`} />;
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-3/4" height="h-4" />
          <SkeletonLine width="w-1/2" height="h-3" />
        </div>
        <SkeletonLine width="w-16" height="h-6" />
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <SkeletonLine width="w-full" height="h-6" />
            <SkeletonLine width="w-full" height="h-3" />
          </div>
        ))}
      </div>
      <SkeletonLine width="w-full" height="h-2" />
    </div>
  );
}

export function SkeletonStudentRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg glass-card animate-fade-in">
      <div className="skeleton h-9 w-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="w-40" height="h-4" />
        <SkeletonLine width="w-24" height="h-3" />
      </div>
      <SkeletonLine width="w-20" height="h-6" />
      <SkeletonLine width="w-16" height="h-4" />
      <SkeletonLine width="w-16" height="h-4" />
      <SkeletonLine width="w-8" height="h-8" />
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-24" height="h-4" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
      <SkeletonLine width="w-20" height="h-8" />
      <SkeletonLine width="w-32" height="h-3" />
    </div>
  );
}
