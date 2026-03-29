// LoadingSkeleton.jsx — shows animated placeholder while data loads
// This is a professional UX pattern used in all major apps
// (Facebook, LinkedIn, YouTube all use this)

import React from 'react';

// Single skeleton block with pulse animation
function SkeletonBlock({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
  );
}

// Skeleton for a stat card
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <SkeletonBlock className="h-3 w-24 mb-3" />
      <SkeletonBlock className="h-8 w-16 mb-2" />
      <SkeletonBlock className="h-2 w-20" />
    </div>
  );
}

// Skeleton for a job card
export function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex justify-between mb-3">
        <div>
          <SkeletonBlock className="h-4 w-36 mb-2" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
        <SkeletonBlock className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-3 mb-3">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-3 w-16" />
      </div>
      <div className="flex gap-1.5">
        <SkeletonBlock className="h-5 w-14 rounded-full" />
        <SkeletonBlock className="h-5 w-12 rounded-full" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

// Skeleton for a chart
export function ChartSkeleton({ height = 300 }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <SkeletonBlock className="h-4 w-48 mb-2" />
      <SkeletonBlock className="h-3 w-32 mb-4" />
      <div
        className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"
        style={{ height: `${height}px` }}
      ></div>
    </div>
  );
}

export default SkeletonBlock;