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
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Elevated SplitM Zero-Sum Ribbon Vector Mark */}
      <svg
        viewBox="0 0 100 100"
        width={pixelSize}
        height={pixelSize}
        className={`shrink-0 overflow-visible ${animated ? 'animate-logo-pulse' : ''}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="splitm-grad-left" x1="0%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#004aad" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="splitm-grad-right" x1="50%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="splitm-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Ambient background glow ring */}
        <circle cx="50" cy="52" r="38" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.12" strokeDasharray="3 3" />

        {/* Left flowing stream: climbs from bottom left, curves over crest, weaves to zero-sum center */}
        <path
          d="M 18 82 C 18 48, 20 28, 28 24 C 36 20, 44 38, 50 56"
          fill="none"
          stroke="url(#splitm-grad-left)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#splitm-glow-filter)"
        />

        {/* Right flowing stream: converges from center, climbs crest, anchors at bottom right */}
        <path
          d="M 50 56 C 56 38, 64 20, 72 24 C 80 28, 82 48, 82 82"
          fill="none"
          stroke="url(#splitm-grad-right)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#splitm-glow-filter)"
        />

        {/* Zero-Sum Convergence Nexus Node (Intersection where debts clear) */}
        <circle cx="50" cy="56" r="4.5" fill="#FFFFFF" stroke="#38bdf8" strokeWidth="2" />
      </svg>

      {/* Authentic Dual-Gradient Logo Typography from Original Version */}
      {showText && (
        <span className={`font-sans tracking-tight font-extrabold leading-none ${fontClass}`}>
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
              textShadow: '0 0 14px rgba(56, 189, 248, 0.55)',
            }}
          >
            M
          </span>
        </span>
      )}
    </div>
  );
};

export default SplitMLogo;
