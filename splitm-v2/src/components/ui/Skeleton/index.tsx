import React from 'react';
import { cn } from '../../../core/utils/helpers';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-700/50", className)}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
};
