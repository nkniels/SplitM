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
      {/* Authentic SplitM Dual-Stroke SVG Mark from Original Version */}
      <svg
        viewBox="0 0 100 100"
        width={pixelSize}
        height={pixelSize}
        className={`shrink-0 overflow-visible ${animated ? 'animate-logo-pulse' : ''}`}
        aria-hidden="true"
      >
        <path
          d="M15 85 L15 35 L40 60 L60 30"
          fill="none"
          stroke="#004aad"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 85 L60 55 L85 85 L85 30"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
