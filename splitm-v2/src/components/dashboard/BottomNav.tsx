import React from 'react';
import {
  SquaresFour,
  Receipt,
  Plus,
  Users,
  User,
} from '@phosphor-icons/react';
import { ReceiptTearDivider } from './ReceiptTearDivider';
import { UndrawTransferMoney, UndrawReceipt } from '../illustrations/UndrawIllustrations';

export type NavTabId = 'dashboard' | 'history' | 'groups' | 'profile';

interface BottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  onAddClick: () => void;
  className?: string;
}

/**
 * BottomNav
 * Deboarded mobile navigation dock:
 * - Does not stretch flat edge-to-edge across the screen; framed as a floating receipt island
 * - Deboarded on both sides with subtle SaaS illustrations (MTN/Orange MoMo token & Zero-Sum Ledger seal)
 * - Receipt tear-off divider cut off to match the docked receipt slip width
 * - Floating raised terracotta Plus button overlapping the tear line
 * - Respects safe-area insets at the bottom
 */
export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onAddClick,
  className = '',
}) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-[max(env(safe-area-inset-bottom),12px)] px-2 sm:px-4 ${className}`}
      aria-label="Primary navigation dock"
    >
      <div className="max-w-md mx-auto flex items-end justify-center gap-1.5 sm:gap-2 relative">
        {/* Left Flank unDraw SaaS Illustration */}
        <div
          className="pointer-events-auto hidden min-[360px]:flex flex-col items-center justify-center w-12 h-14 mb-1 rounded-2xl bg-surface/95 border border-border shadow-sm p-1 transition-all duration-200 hover:scale-105 select-none overflow-hidden group"
          title="Pool Money & Mobile Money Payments (Illustration by unDraw)"
        >
          <div className="w-8 h-7 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UndrawTransferMoney width={30} height={22} primaryColor="#0284C7" secondaryColor="#D95D39" />
          </div>
          <span className="text-[7.5px] font-mono font-bold tracking-tight text-muted uppercase">
            Pool
          </span>
        </div>

        {/* Center Deboarded Docked Receipt Slip (houses the 5 icons) */}
        <nav
          className="pointer-events-auto flex-1 max-w-[290px] sm:max-w-[310px] rounded-3xl bg-surface/98 border border-border shadow-xl relative overflow-hidden backdrop-blur-sm transition-colors duration-200"
          aria-label="Access icons"
        >
          {/* Signature Scalloped Receipt Tear-Off Edge along top of docked slip */}
          <ReceiptTearDivider orientation="top" />

          {/* 5-Item Navigation Grid */}
          <div className="px-2 h-14 flex items-center justify-between relative">
            {/* 1. Dashboard */}
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-colors duration-150 ${
                activeTab === 'dashboard'
                  ? 'text-primary'
                  : 'text-muted hover:text-primary'
              }`}
              aria-label="Dashboard"
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            >
              <SquaresFour
                size={21}
                weight={activeTab === 'dashboard' ? 'fill' : 'duotone'}
              />
              <span className="text-[9px] font-medium tracking-tight mt-0.5">
                Home
              </span>
              {activeTab === 'dashboard' && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>

            {/* 2. History */}
            <button
              onClick={() => onTabChange('history')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-colors duration-150 ${
                activeTab === 'history'
                  ? 'text-primary'
                  : 'text-muted hover:text-primary'
              }`}
              aria-label="Expense History"
              aria-current={activeTab === 'history' ? 'page' : undefined}
            >
              <Receipt
                size={21}
                weight={activeTab === 'history' ? 'fill' : 'duotone'}
              />
              <span className="text-[9px] font-medium tracking-tight mt-0.5">
                Bills
              </span>
              {activeTab === 'history' && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>

            {/* 3. Add Expense / Pooled Payment (Floating Raised Plus Button) */}
            <div className="flex-1 flex justify-center -mt-5 relative z-10">
              <button
                onClick={onAddClick}
                className="w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-accent-hover active:scale-95 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-accent/20 border-2 border-surface"
                aria-label="Add expense or start pooled payment"
                title="Add expense or start pooled payment"
              >
                <Plus size={22} weight="bold" />
              </button>
            </div>

            {/* 4. Groups */}
            <button
              onClick={() => onTabChange('groups')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-colors duration-150 ${
                activeTab === 'groups'
                  ? 'text-primary'
                  : 'text-muted hover:text-primary'
              }`}
              aria-label="Groups"
              aria-current={activeTab === 'groups' ? 'page' : undefined}
            >
              <Users
                size={21}
                weight={activeTab === 'groups' ? 'fill' : 'duotone'}
              />
              <span className="text-[9px] font-medium tracking-tight mt-0.5">
                Groups
              </span>
              {activeTab === 'groups' && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>

            {/* 5. Profile */}
            <button
              onClick={() => onTabChange('profile')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-colors duration-150 ${
                activeTab === 'profile'
                  ? 'text-primary'
                  : 'text-muted hover:text-primary'
              }`}
              aria-label="Account Settings"
              aria-current={activeTab === 'profile' ? 'page' : undefined}
            >
              <User
                size={21}
                weight={activeTab === 'profile' ? 'fill' : 'duotone'}
              />
              <span className="text-[9px] font-medium tracking-tight mt-0.5">
                Profile
              </span>
              {activeTab === 'profile' && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          </div>
        </nav>

        {/* Right Flank unDraw SaaS Illustration */}
        <div
          className="pointer-events-auto hidden min-[360px]:flex flex-col items-center justify-center w-12 h-14 mb-1 rounded-2xl bg-surface/95 border border-border shadow-sm p-1 transition-all duration-200 hover:scale-105 select-none overflow-hidden group"
          title="Zero-Sum Greedy Debt Settlement & Vouchers (Illustration by unDraw)"
        >
          <div className="w-8 h-7 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UndrawReceipt width={30} height={22} primaryColor="#0284C7" secondaryColor="#10B981" />
          </div>
          <span className="text-[7.5px] font-mono font-bold tracking-tight text-muted uppercase">
            Σ=0
          </span>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
