import React from 'react';

interface DashboardSkeletonProps {
  className?: string;
}

/**
 * DashboardSkeleton
 * High-fidelity skeleton loading screen that mirrors the exact layout geometry
 * of the SplitM mobile dashboard:
 * - Top header with logo & action placeholders
 * - Active group card with floating inner avatar rings, title, balance pill & ledger widgets
 * - Secondary inactive cards with subtle inner avatar placeholders
 * - Docked receipt-tear bottom navigation with floating center plus button
 * - Shimmering animation sweep for realistic perceived performance
 */
export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`min-h-screen bg-background text-primary selection:bg-accent/20 transition-colors duration-200 select-none ${className}`}
      role="status"
      aria-label="Loading dashboard UI elements..."
    >
      {/* Centered Phone Screen Canvas */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between relative shadow-sm">
        {/* Top Header Bar Skeleton */}
        <header className="px-5 pt-4 pb-2 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            {/* Logo skeleton */}
            <div className="w-8 h-8 rounded-xl bg-muted/20 animate-pulse" />
            <div className="w-16 h-4 rounded-md bg-muted/20 animate-pulse" />
            <div className="w-20 h-4 rounded-full bg-border-subtle/60 animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-surface border border-border-subtle animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-muted/25 border border-border animate-pulse" />
          </div>
        </header>

        {/* Main Content Area Skeleton */}
        <main className="flex-1 px-4 pt-1 pb-28 overflow-y-auto">
          {/* Active Group Card Skeleton */}
          <div className="relative w-full my-2">
            <div className="relative w-full rounded-3xl bg-surface border border-border shadow-lg py-8 px-6 min-h-[290px] overflow-hidden">
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer pointer-events-none" />

              {/* Top Watermark Skeleton */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-24 h-3 rounded bg-muted/20 animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="w-12 h-4 rounded-md bg-muted/15 animate-pulse" />
                  <div className="w-16 h-3 rounded bg-muted/15 animate-pulse" />
                </div>
              </div>

              {/* Centered Title & Subtitle Skeleton */}
              <div className="flex flex-col items-center justify-center text-center mt-2 space-y-2">
                <div className="w-52 h-7 rounded-xl bg-muted/25 animate-pulse" />
                <div className="w-36 h-3.5 rounded-md bg-muted/15 animate-pulse" />

                {/* Balance Badge Pill Skeleton */}
                <div className="w-44 h-6 rounded-full bg-background border border-border animate-pulse mt-2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-muted/30 mr-2" />
                  <div className="w-28 h-2.5 rounded bg-muted/20" />
                </div>
              </div>

              {/* Bottom Financial Grid Skeleton */}
              <div className="w-full mt-6 pt-4 border-t border-dashed border-border-subtle">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-background/60 border border-border-subtle space-y-2">
                    <div className="w-16 h-2.5 rounded bg-muted/20 animate-pulse" />
                    <div className="w-24 h-4 rounded bg-muted/30 animate-pulse" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-background/60 border border-border-subtle space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="w-16 h-2.5 rounded bg-muted/20 animate-pulse" />
                      <div className="w-8 h-2.5 rounded bg-muted/25 animate-pulse" />
                    </div>
                    <div className="w-20 h-4 rounded bg-muted/30 animate-pulse" />
                    <div className="w-full h-1 rounded-full bg-border overflow-hidden">
                      <div className="w-1/2 h-full bg-accent/40 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Inner Avatar Skeletons (Positioned strictly inside card boundaries, clear of title) */}
              <div
                style={{ left: '12%', top: '18%', transform: 'translate(-50%, -50%)' }}
                className="absolute z-10 w-10 h-10 rounded-full bg-surface-elevated border-2 border-border/80 shadow-md animate-pulse"
              />
              <div
                style={{ left: '88%', top: '18%', transform: 'translate(-50%, -50%)' }}
                className="absolute z-10 w-10 h-10 rounded-full bg-surface-elevated border-2 border-border/80 shadow-md animate-pulse"
              />
              <div
                style={{ left: '90%', top: '54%', transform: 'translate(-50%, -50%)' }}
                className="absolute z-10 w-10 h-10 rounded-full bg-surface-elevated border-2 border-border/80 shadow-md animate-pulse"
              />
              <div
                style={{ left: '80%', top: '86%', transform: 'translate(-50%, -50%)' }}
                className="absolute z-10 w-10 h-10 rounded-full bg-surface-elevated border-2 border-border/80 shadow-md animate-pulse"
              />
              <div
                style={{ left: '20%', top: '86%', transform: 'translate(-50%, -50%)' }}
                className="absolute z-10 w-10 h-10 rounded-full bg-surface-elevated border-2 border-border/80 shadow-md animate-pulse"
              />
              <div
                style={{ left: '10%', top: '54%', transform: 'translate(-50%, -50%)' }}
                className="absolute z-10 w-10 h-10 rounded-full bg-surface-elevated border-2 border-border/80 shadow-md animate-pulse"
              />
            </div>
          </div>

          {/* Section Divider Skeleton */}
          <div className="mt-8 mb-4 px-2 flex items-center justify-between">
            <div className="w-28 h-3.5 rounded bg-muted/20 animate-pulse" />
            <div className="w-20 h-2.5 rounded bg-muted/15 animate-pulse" />
          </div>

          {/* Inactive Secondary Cards Skeletons */}
          <div className="space-y-4">
            {[1, 2].map((idx) => (
              <div key={idx} className="relative w-full my-1.5 opacity-80">
                <div className="relative w-full rounded-3xl bg-surface/90 border border-border-subtle py-5 px-5 min-h-[175px] overflow-hidden">
                  <div className="flex justify-between items-center mb-3">
                    <div className="w-20 h-2.5 rounded bg-muted/20 animate-pulse" />
                    <div className="w-16 h-2.5 rounded bg-muted/15 animate-pulse" />
                  </div>

                  <div className="flex flex-col items-center justify-center text-center space-y-2 my-2">
                    <div className="w-40 h-5 rounded-lg bg-muted/25 animate-pulse" />
                    <div className="w-28 h-3 rounded bg-muted/15 animate-pulse" />
                    <div className="w-36 h-5 rounded-full bg-background border border-border/60 animate-pulse mt-1" />
                  </div>

                  <div className="w-32 h-3 rounded bg-muted/15 animate-pulse mx-auto mt-3" />

                  {/* Compact inner avatar placeholders */}
                  <div
                    style={{ left: '16%', top: '30%', transform: 'translate(-50%, -50%)' }}
                    className="absolute z-10 w-7 h-7 rounded-full bg-surface-elevated border border-border shadow-xs animate-pulse"
                  />
                  <div
                    style={{ left: '84%', top: '30%', transform: 'translate(-50%, -50%)' }}
                    className="absolute z-10 w-7 h-7 rounded-full bg-surface-elevated border border-border shadow-xs animate-pulse"
                  />
                  <div
                    style={{ left: '84%', top: '70%', transform: 'translate(-50%, -50%)' }}
                    className="absolute z-10 w-7 h-7 rounded-full bg-surface-elevated border border-border shadow-xs animate-pulse"
                  />
                  <div
                    style={{ left: '16%', top: '70%', transform: 'translate(-50%, -50%)' }}
                    className="absolute z-10 w-7 h-7 rounded-full bg-surface-elevated border border-border shadow-xs animate-pulse"
                  />
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Docked Bottom Navigation Skeleton Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-[max(env(safe-area-inset-bottom),12px)] px-2 sm:px-4">
          <div className="max-w-md mx-auto flex items-end justify-center gap-1.5 sm:gap-2 relative">
            {/* Left Flank Placeholder */}
            <div className="hidden min-[360px]:flex flex-col items-center justify-center w-12 h-14 mb-1 rounded-2xl bg-surface/95 border border-border shadow-sm p-1 animate-pulse">
              <div className="w-6 h-6 rounded-lg bg-muted/20" />
            </div>

            {/* Center Docked Nav Slip */}
            <nav className="flex-1 max-w-[290px] sm:max-w-[310px] rounded-3xl bg-surface/98 border border-border shadow-xl relative overflow-hidden h-14 px-2 flex items-center justify-between">
              {/* Top tear dashed border */}
              <div className="absolute top-0 left-0 right-0 h-1 border-t border-dashed border-border-subtle" />

              {/* 5 Nav Tab Icons */}
              <div className="flex-1 flex flex-col items-center justify-center gap-1">
                <div className="w-5 h-5 rounded-md bg-muted/25 animate-pulse" />
                <div className="w-6 h-2 rounded bg-muted/15" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-1">
                <div className="w-5 h-5 rounded-md bg-muted/20 animate-pulse" />
                <div className="w-7 h-2 rounded bg-muted/15" />
              </div>

              {/* Center Raised Plus Action */}
              <div className="flex-1 flex items-center justify-center relative -top-3">
                <div className="w-12 h-12 rounded-full bg-accent/40 border-2 border-surface shadow-md flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 rounded-sm bg-white/70" />
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-1">
                <div className="w-5 h-5 rounded-md bg-muted/20 animate-pulse" />
                <div className="w-7 h-2 rounded bg-muted/15" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-1">
                <div className="w-5 h-5 rounded-md bg-muted/20 animate-pulse" />
                <div className="w-7 h-2 rounded bg-muted/15" />
              </div>
            </nav>

            {/* Right Flank Placeholder */}
            <div className="hidden min-[360px]:flex flex-col items-center justify-center w-12 h-14 mb-1 rounded-2xl bg-surface/95 border border-border shadow-sm p-1 animate-pulse">
              <div className="w-6 h-6 rounded-lg bg-muted/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
