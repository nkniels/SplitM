import React from 'react';

interface ReceiptTearDividerProps {
  /**
   * 'top' means the tear edge is at the top of a surface (like the bottom nav bar).
   * 'bottom' means the tear edge is at the bottom of a card.
   */
  orientation?: 'top' | 'bottom';
  className?: string;
  showPerforation?: boolean;
}

/**
 * ReceiptTearDivider
 * Signature visual motif for SplitM: a horizontal line of scalloped paper notches
 * with a perforated score line, mimicking a real cash-register receipt tear.
 *
 * Vector-patterned to seamlessly scale from 320px to 1440px+ without stretching.
 * High-contrast in both light (warm paper) and dark (warm charcoal) modes.
 */
export const ReceiptTearDivider: React.FC<ReceiptTearDividerProps> = ({
  orientation = 'top',
  className = '',
  showPerforation = true,
}) => {
  const isTop = orientation === 'top';

  return (
    <div
      className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Micro-perforation dashed line (needle punch marks where receipt was torn) */}
      {showPerforation && (
        <div
          className={`w-full h-[1px] border-t border-dashed opacity-50 dark:opacity-60 transition-colors ${
            isTop ? 'mb-[2px]' : 'mt-[2px]'
          }`}
          style={{
            borderColor: 'var(--color-border)',
            borderTopWidth: '1.5px',
          }}
        />
      )}

      {/* Scalloped Notched Tear Edge */}
      <div className="relative w-full h-[10px] overflow-hidden">
        <svg
          className="w-full h-[10px] block"
          style={{ minWidth: '100%' }}
        >
          <defs>
            <pattern
              id={isTop ? 'receipt-notch-top' : 'receipt-notch-bottom'}
              x="0"
              y="0"
              width="16"
              height="11"
              patternUnits="userSpaceOnUse"
            >
              {isTop ? (
                // Notches facing upward into the bottom bar surface:
                <g>
                  {/* Base nav bar surface fill */}
                  <rect x="0" y="0" width="16" height="11" fill="var(--color-surface)" />
                  {/* Semicircular notch cutout filled with background paper tone */}
                  <path
                    d="M 2.5 0 C 2.5 5.5, 13.5 5.5, 13.5 0 Z"
                    fill="var(--color-tear-notch)"
                  />
                  {/* Crisp notch rim contour stroke */}
                  <path
                    d="M 0 0 L 2.5 0 C 2.5 5.5, 13.5 5.5, 13.5 0 L 16 0"
                    fill="none"
                    stroke="var(--color-tear-border)"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </g>
              ) : (
                // Notches along the bottom edge of a card
                <g>
                  <rect x="0" y="0" width="16" height="11" fill="var(--color-background)" />
                  <path
                    d="M 2.5 11 C 2.5 5.5, 13.5 5.5, 13.5 11 Z"
                    fill="var(--color-surface)"
                  />
                  <path
                    d="M 0 11 L 2.5 11 C 2.5 5.5, 13.5 5.5, 13.5 11 L 16 11"
                    fill="none"
                    stroke="var(--color-tear-border)"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </pattern>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="11"
            fill={`url(#${isTop ? 'receipt-notch-top' : 'receipt-notch-bottom'})`}
          />
        </svg>
      </div>
    </div>
  );
};

export default ReceiptTearDivider;
