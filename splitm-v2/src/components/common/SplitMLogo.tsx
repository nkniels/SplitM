import React from 'react';

interface SplitMLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  animated?: boolean;
}

export const SplitMLogo: React.FC<SplitMLogoProps> = ({
  size = 'md',
  showText = true,
  textSize,
  className = '',
  animated = false,
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 24
      : size === 'md'
      ? 36
      : size === 'lg'
      ? 52
      : 80;

  const fontClass =
    textSize === 'sm'
      ? 'text-sm'
      : textSize === 'md'
      ? 'text-lg'
      : textSize === 'lg'
      ? 'text-2xl'
      : textSize === 'xl'
      ? 'text-3xl'
      : textSize === '2xl'
      ? 'text-4xl'
      : textSize === '3xl'
      ? 'text-5xl'
      : size === 'sm'
      ? 'text-base'
      : size === 'md'
      ? 'text-xl'
      : size === 'lg'
      ? 'text-3xl'
      : 'text-4xl';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Authentic Reverted Dual-Stroke SplitM Geometric M Mark */}
      <svg
        viewBox="0 0 100 100"
        width={pixelSize}
        height={pixelSize}
        className={`shrink-0 overflow-visible ${animated ? 'animate-logo-pulse' : ''}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="splitm-stroke-left" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#004aad" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="splitm-stroke-right" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Left stroke */}
        <path
          d="M15 85 L15 35 L40 60 L60 30"
          fill="none"
          stroke="url(#splitm-stroke-left)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right stroke */}
        <path
          d="M40 85 L60 55 L85 85 L85 30"
          fill="none"
          stroke="url(#splitm-stroke-right)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Modern, Professional Big-Tech Clean Typography (Zero amateur neon glow) */}
      {showText && (
        <span className={`font-sans tracking-tight font-extrabold leading-none ${fontClass}`}>
          <span
            style={{
              background: 'linear-gradient(135deg, #004aad 0%, #0284c7 60%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Split
          </span>
          <span className="text-[#38bdf8] font-black">
            M
          </span>
        </span>
      )}
    </div>
  );
};

export default SplitMLogo;
