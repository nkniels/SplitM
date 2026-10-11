import React from 'react';

interface UndrawProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * unDraw Transfer Money (Mobile MoMo & Shared Payments)
 * Open-source SVG inspired by undraw.co
 */
export const UndrawTransferMoney: React.FC<UndrawProps> = ({
  className = '',
  width = '100%',
  height = '100%',
  primaryColor = '#0284C7',
  secondaryColor = '#D95D39',
}) => (
  <svg
    viewBox="0 0 400 300"
    width={width}
    height={height}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Base floor shadow */}
    <ellipse cx="200" cy="270" rx="140" ry="12" fill="#E2E8F0" opacity="0.3" />
    
    {/* Left Mobile Device */}
    <rect x="70" y="70" width="85" height="160" rx="14" fill="#1E293B" />
    <rect x="76" y="80" width="73" height="130" rx="8" fill="#F8FAFC" />
    <circle cx="112" cy="220" r="5" fill="#64748B" />
    <rect x="84" y="94" width="57" height="18" rx="4" fill={primaryColor} />
    <rect x="84" y="120" width="45" height="8" rx="3" fill="#CBD5E1" />
    <rect x="84" y="134" width="35" height="6" rx="2" fill="#E2E8F0" />
    <circle cx="125" cy="180" r="14" fill={secondaryColor} />
    <path d="M121 180H129M125 176V184" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

    {/* Right Mobile Device */}
    <rect x="245" y="70" width="85" height="160" rx="14" fill="#1E293B" />
    <rect x="251" y="80" width="73" height="130" rx="8" fill="#F8FAFC" />
    <circle cx="287" cy="220" r="5" fill="#64748B" />
    <rect x="259" y="94" width="57" height="18" rx="4" fill={secondaryColor} />
    <rect x="259" y="120" width="40" height="8" rx="3" fill="#CBD5E1" />
    <rect x="259" y="134" width="50" height="6" rx="2" fill="#E2E8F0" />
    <circle cx="270" cy="180" r="14" fill="#10B981" />
    <path d="M266 180L269 183L275 177" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Connecting Transfer Arc / MoMo Stream */}
    <path
      d="M140 100 C 180 40, 220 40, 260 100"
      stroke={primaryColor}
      strokeWidth="4"
      strokeDasharray="6 6"
      strokeLinecap="round"
    />
    
    {/* Floating Coin in Transit */}
    <g transform="translate(185, 45)">
      <circle cx="15" cy="15" r="15" fill="#F59E0B" />
      <circle cx="15" cy="15" r="11" fill="#FBBF24" />
      <text x="15" y="20" textAnchor="middle" fill="#78350F" fontSize="13" fontWeight="bold" fontFamily="monospace">M</text>
    </g>

    {/* Decorative Floating Dots */}
    <circle cx="170" cy="130" r="4" fill={primaryColor} opacity="0.6" />
    <circle cx="230" cy="140" r="5" fill={secondaryColor} opacity="0.5" />
    <circle cx="200" cy="165" r="3" fill="#10B981" opacity="0.7" />
  </svg>
);

/**
 * unDraw Receipt (Settlement Vouchers & Ledgers)
 * Open-source SVG inspired by undraw.co
 */
export const UndrawReceipt: React.FC<UndrawProps> = ({
  className = '',
  width = '100%',
  height = '100%',
  primaryColor = '#0284C7',
  secondaryColor = '#D95D39',
}) => (
  <svg
    viewBox="0 0 400 300"
    width={width}
    height={height}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Floor shadow */}
    <ellipse cx="200" cy="275" rx="130" ry="10" fill="#E2E8F0" opacity="0.35" />

    {/* Receipt Sheet */}
    <g transform="translate(130, 40)">
      {/* Receipt body with zigzag tear bottom */}
      <path
        d="M 0 0 L 140 0 L 140 200 L 128 190 L 116 200 L 104 190 L 92 200 L 80 190 L 68 200 L 56 190 L 44 200 L 32 190 L 20 200 L 8 190 L 0 200 Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="2"
      />
      {/* Top Header Stamp */}
      <rect x="20" y="20" width="100" height="12" rx="4" fill={primaryColor} />
      <rect x="20" y="42" width="70" height="6" rx="2" fill="#94A3B8" />
      <line x1="20" y1="60" x2="120" y2="60" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />

      {/* Itemized Lines */}
      <rect x="20" y="74" width="55" height="7" rx="2" fill="#CBD5E1" />
      <rect x="95" y="74" width="25" height="7" rx="2" fill="#64748B" />

      <rect x="20" y="92" width="45" height="7" rx="2" fill="#CBD5E1" />
      <rect x="95" y="92" width="25" height="7" rx="2" fill="#64748B" />

      <rect x="20" y="110" width="60" height="7" rx="2" fill="#CBD5E1" />
      <rect x="95" y="110" width="25" height="7" rx="2" fill="#64748B" />

      <line x1="20" y1="130" x2="120" y2="130" stroke="#CBD5E1" strokeWidth="2" />

      {/* Total & Verified Checkmark */}
      <rect x="20" y="142" width="40" height="9" rx="2" fill="#1E293B" />
      <rect x="85" y="142" width="35" height="9" rx="2" fill={secondaryColor} />

      <circle cx="70" cy="172" r="10" fill="#10B981" />
      <path d="M66 172L69 175L74 169" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Person Inspecting Receipt */}
    <g transform="translate(60, 90)">
      {/* Head */}
      <circle cx="40" cy="30" r="16" fill="#334155" />
      {/* Torso */}
      <path d="M 22 55 C 22 45, 58 45, 58 55 L 62 120 L 18 120 Z" fill={primaryColor} />
      {/* Arm pointing to receipt */}
      <path d="M 55 65 L 85 85" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
    </g>

    {/* Floating Zero-Sum Bubble */}
    <g transform="translate(265, 80)">
      <circle cx="28" cy="28" r="28" fill="#10B981" opacity="0.15" />
      <circle cx="28" cy="28" r="22" fill="#10B981" />
      <text x="28" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="monospace">Σ=0</text>
    </g>
  </svg>
);

/**
 * unDraw Collaborators / Team (Group Expense Sharing)
 * Open-source SVG inspired by undraw.co
 */
export const UndrawCollaborators: React.FC<UndrawProps> = ({
  className = '',
  width = '100%',
  height = '100%',
  primaryColor = '#0284C7',
  secondaryColor = '#D95D39',
}) => (
  <svg
    viewBox="0 0 400 300"
    width={width}
    height={height}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Shadow */}
    <ellipse cx="200" cy="275" rx="140" ry="12" fill="#E2E8F0" opacity="0.3" />

    {/* Central Shared Expense Hub / Pot */}
    <rect x="155" y="140" width="90" height="100" rx="16" fill="#1E293B" />
    <rect x="165" y="152" width="70" height="40" rx="8" fill={primaryColor} />
    <circle cx="200" cy="172" r="12" fill="#FFFFFF" />
    <text x="200" y="177" textAnchor="middle" fill={primaryColor} fontSize="14" fontWeight="bold" fontFamily="monospace">M</text>
    <rect x="175" y="206" width="50" height="8" rx="4" fill="#64748B" />

    {/* Left Friend */}
    <g transform="translate(60, 110)">
      <circle cx="35" cy="25" r="16" fill="#334155" />
      <path d="M 18 52 C 18 40, 52 40, 52 52 L 56 120 L 14 120 Z" fill={secondaryColor} />
      <path d="M 48 65 L 85 90" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
    </g>

    {/* Right Friend */}
    <g transform="translate(270, 110)">
      <circle cx="35" cy="25" r="16" fill="#334155" />
      <path d="M 18 52 C 18 40, 52 40, 52 52 L 56 120 L 14 120 Z" fill="#10B981" />
      <path d="M 22 65 L -15 90" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
    </g>

    {/* Floating Shared Goal Bubbles */}
    <circle cx="140" cy="70" r="18" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
    <path d="M135 70H145M140 65V75" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />

    <circle cx="260" cy="70" r="18" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
    <path d="M255 70L259 74L267 66" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * unDraw Vault / Savings (Pool Money & Group Escrow)
 * Open-source SVG inspired by undraw.co
 */
export const UndrawVault: React.FC<UndrawProps> = ({
  className = '',
  width = '100%',
  height = '100%',
  primaryColor = '#0284C7',
  secondaryColor = '#D95D39',
}) => (
  <svg
    viewBox="0 0 400 300"
    width={width}
    height={height}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <ellipse cx="200" cy="275" rx="130" ry="12" fill="#E2E8F0" opacity="0.3" />

    {/* Vault Safe Box */}
    <rect x="130" y="70" width="140" height="160" rx="20" fill="#1E293B" />
    <rect x="142" y="82" width="116" height="136" rx="14" fill="#334155" />

    {/* Safe Door Wheel */}
    <circle cx="200" cy="150" r="36" fill={primaryColor} />
    <circle cx="200" cy="150" r="26" fill="#1E293B" />
    <circle cx="200" cy="150" r="10" fill="#FFFFFF" />

    {/* Safe Spoke Handles */}
    <line x1="200" y1="120" x2="200" y2="180" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    <line x1="170" y1="150" x2="230" y2="150" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

    {/* Keypad & Status LED */}
    <circle cx="238" cy="100" r="4" fill="#10B981" />
    <rect x="156" y="96" width="30" height="8" rx="2" fill="#64748B" />

    {/* Coins Piled on Side */}
    <g transform="translate(80, 190)">
      <ellipse cx="20" cy="30" rx="18" ry="7" fill="#F59E0B" />
      <ellipse cx="20" cy="24" rx="18" ry="7" fill="#FBBF24" />
      <ellipse cx="20" cy="18" rx="18" ry="7" fill="#FDE68A" />
    </g>

    <g transform="translate(280, 190)">
      <ellipse cx="20" cy="30" rx="18" ry="7" fill={secondaryColor} />
      <ellipse cx="20" cy="24" rx="18" ry="7" fill="#F97316" />
    </g>
  </svg>
);

/**
 * unDraw Secure Login (Authentication & Access)
 * Open-source SVG inspired by undraw.co
 */
export const UndrawSecureLogin: React.FC<UndrawProps> = ({
  className = '',
  width = '100%',
  height = '100%',
  primaryColor = '#0284C7',
  secondaryColor = '#D95D39',
}) => (
  <svg
    viewBox="0 0 400 300"
    width={width}
    height={height}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <ellipse cx="200" cy="270" rx="130" ry="12" fill="#E2E8F0" opacity="0.3" />

    {/* Security Shield / Keyhole Card */}
    <rect x="135" y="70" width="130" height="160" rx="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
    <path
      d="M200 95 C 170 95, 160 115, 160 145 C 160 185, 200 205, 200 205 C 200 205, 240 185, 240 145 C 240 115, 230 95, 200 95 Z"
      fill={primaryColor}
    />
    {/* Keyhole */}
    <circle cx="200" cy="140" r="8" fill="#FFFFFF" />
    <polygon points="196,144 204,144 206,160 194,160" fill="#FFFFFF" />

    {/* Person Unlocking */}
    <g transform="translate(60, 110)">
      <circle cx="30" cy="22" r="14" fill="#334155" />
      <path d="M 16 46 C 16 36, 44 36, 44 46 L 48 110 L 12 110 Z" fill={secondaryColor} />
      <path d="M 40 55 L 75 75" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Floating Checkmark Stamp */}
    <circle cx="295" cy="115" r="20" fill="#10B981" />
    <path d="M288 115L293 120L303 110" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
