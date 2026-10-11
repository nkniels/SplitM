import { Coins, Wallet, Receipt, CreditCard } from '@phosphor-icons/react';
import { UndrawCollaborators } from '../illustrations/UndrawIllustrations';

interface LoadingSplashScreenProps {
  subtitle?: string;
  className?: string;
}

export const LoadingSplashScreen: React.FC<LoadingSplashScreenProps> = ({
  subtitle = 'Loading SplitM...',
  className = '',
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background text-primary overflow-hidden select-none ${className}`}
      role="status"
      aria-label="Loading SplitM"
    >
      {/* Background Floating Currency Icons (from original SplitM version) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[12%] left-[12%] text-muted/15 animate-float-slow">
          <Coins size={44} weight="duotone" />
        </div>
        <div className="absolute top-[70%] left-[82%] text-muted/15 animate-float-reverse">
          <Wallet size={52} weight="duotone" />
        </div>
        <div className="absolute top-[22%] left-[72%] text-muted/15 animate-float-medium">
          <Receipt size={40} weight="duotone" />
        </div>
        <div className="absolute top-[78%] left-[18%] text-muted/15 animate-float-reverse-fast">
          <CreditCard size={36} weight="duotone" />
        </div>
      </div>

      {/* Centered Splash Content with Zoom-in Elastic Animation */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 animate-splash-zoom">
        {/* Authentic Dual-Stroke SplitM SVG Mark */}
        <div className="relative mb-4">
          <svg
            viewBox="0 0 100 100"
            className="w-24 h-24 sm:w-28 sm:h-28 overflow-visible filter drop-shadow-[0_4px_16px_rgba(56,189,248,0.25)]"
          >
            <path
              d="M15 85 L15 35 L40 60 L60 30"
              fill="none"
              stroke="#004aad"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
            <path
              d="M40 85 L60 55 L85 85 L85 30"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Authentic Splash Title */}
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl tracking-tight">
          <span
            style={{
              background: 'linear-gradient(90deg, #004aad, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Split
          </span>
          <span
            style={{
              color: '#38bdf8',
              textShadow: '0 0 16px rgba(56, 189, 248, 0.6)',
            }}
          >
            M
          </span>
        </h1>

        {/* Authentic Shimmer Skeleton Loader Bar */}
        <div className="mt-5 w-40 sm:w-48 h-2.5 rounded-full overflow-hidden bg-border/40 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#38bdf8]/60 to-transparent animate-shimmer-bar" />
        </div>

        {/* Optional Subtitle */}
        {subtitle && (
          <p className="mt-3 text-xs font-mono tracking-wider text-muted animate-fade-in">
            {subtitle}
          </p>
        )}

        {/* unDraw Group Sharing Illustration */}
        <div className="w-48 h-28 mt-4 opacity-85">
          <UndrawCollaborators primaryColor="#0284C7" secondaryColor="#D95D39" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSplashScreen;
