// frontend/src/components/LoadingSkeleton.jsx
import React from 'react';

const StatCardSkeleton = () => (
  <div className="bg-base-100 rounded-xl h-24 animate-pulse">
    <div className="p-4 flex items-center gap-3">
      <div className="rounded-full h-12 w-12 bg-base-300"></div>
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-base-300 rounded w-24"></div>
        <div className="h-6 bg-base-300 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const CardSkeleton = () => (
  <div className="card bg-base-100 animate-pulse h-48">
    <div className="card-body p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="h-5 bg-base-300 rounded w-32"></div>
        <div className="h-8 w-8 bg-base-300 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-base-300 rounded w-full"></div>
        <div className="h-3 bg-base-300 rounded w-full"></div>
        <div className="h-3 bg-base-300 rounded w-3/4"></div>
        <div className="h-3 bg-base-300 rounded w-3/4"></div>
      </div>
      <div className="mt-3 flex justify-end">
        <div className="h-5 bg-base-300 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const SearchSkeleton = () => (
  <div className="bg-base-100 rounded-lg h-16 animate-pulse mb-5">
    <div className="p-4 flex justify-between">
      <div className="h-8 bg-base-300 rounded w-3/4"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-base-300 rounded w-20"></div>
        <div className="h-8 bg-base-300 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const LoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      
      {/* Search/filter skeleton */}
      <SearchSkeleton />
      
      {/* Member cards skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
};

export default LoadingSkeleton;