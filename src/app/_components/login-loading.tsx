import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export const LoginSkeleton = () => {
  return (
    <div className="flex w-1/2 flex-col items-center">
      <div className="mb-4 w-full">
        <div className="mb-2">
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="mt-2">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="mb-8 w-full">
        <div className="mb-2">
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="mt-2">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
};
