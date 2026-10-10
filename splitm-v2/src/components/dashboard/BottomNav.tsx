import React from 'react';
import {
  SquaresFour,
  Receipt,
  Plus,
  Users,
  User,
} from '@phosphor-icons/react';
import { ReceiptTearDivider } from './ReceiptTearDivider';

export type NavTabId = 'dashboard' | 'history' | 'groups' | 'profile';

interface BottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  onAddClick: () => void;
  className?: string;
}

/**
 * BottomNav
 * Fixed mobile navigation bar (70-80px tall) with:
 * - Scalloped receipt tear-off divider across the entire top edge
 * - Exactly 5 items (Dashboard, History, Floating Raised Plus, Groups, Profile)
 * - Raised center Plus button overlapping the receipt tear line in terracotta accent
 * - Respects env(safe-area-inset-bottom) for notched phones
 */
export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onAddClick,
  className = '',
}) => {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 bg-surface/98 backdrop-blur-sm transition-colors duration-200 ${className}`}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
      }}
      aria-label="Primary mobile navigation"
    >
      {/* Signature Receipt Tear-Off Edge at the top of the nav bar */}
      <ReceiptTearDivider orientation="top" />

      {/* 5-Item Navigation Grid */}
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* 1. Dashboard (home/grid icon) — current screen */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 ${
            activeTab === 'dashboard'
              ? 'text-primary'
              : 'text-muted hover:text-primary'
          }`}
          aria-label="Dashboard"
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <SquaresFour
            size={24}
            weight={activeTab === 'dashboard' ? 'fill' : 'duotone'}
          />
          <span className="text-[10px] font-medium tracking-tight mt-1">
            Dashboard
          </span>
          {activeTab === 'dashboard' && (
            <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
          )}
        </button>

        {/* 2. Transaction / Expense History (receipt icon) */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 ${
            activeTab === 'history'
              ? 'text-primary'
              : 'text-muted hover:text-primary'
          }`}
          aria-label="Expense History"
          aria-current={activeTab === 'history' ? 'page' : undefined}
        >
          <Receipt
            size={24}
            weight={activeTab === 'history' ? 'fill' : 'duotone'}
          />
          <span className="text-[10px] font-medium tracking-tight mt-1">
            History
          </span>
          {activeTab === 'history' && (
            <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
          )}
        </button>

        {/* 3. Add Expense / Pooled Payment (Floating Raised Plus Button) */}
        <div className="flex-1 flex justify-center -mt-6 relative z-10">
          <button
            onClick={onAddClick}
            className="w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-accent-hover active:scale-95 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-accent/20 border-2 border-surface"
            aria-label="Add expense or start pooled payment"
            title="Add expense or start pooled payment"
          >
            <Plus size={26} weight="bold" />
          </button>
        </div>

        {/* 4. Groups (people/group icon) */}
        <button
          onClick={() => onTabChange('groups')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 ${
            activeTab === 'groups'
              ? 'text-primary'
              : 'text-muted hover:text-primary'
          }`}
          aria-label="Groups"
          aria-current={activeTab === 'groups' ? 'page' : undefined}
        >
          <Users
            size={24}
            weight={activeTab === 'groups' ? 'fill' : 'duotone'}
          />
          <span className="text-[10px] font-medium tracking-tight mt-1">
            Groups
          </span>
          {activeTab === 'groups' && (
            <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
          )}
        </button>

        {/* 5. Profile / Account Settings (person/avatar icon) */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 ${
            activeTab === 'profile'
              ? 'text-primary'
              : 'text-muted hover:text-primary'
          }`}
          aria-label="Account Settings"
          aria-current={activeTab === 'profile' ? 'page' : undefined}
        >
          <User
            size={24}
            weight={activeTab === 'profile' ? 'fill' : 'duotone'}
          />
          <span className="text-[10px] font-medium tracking-tight mt-1">
            Profile
          </span>
          {activeTab === 'profile' && (
            <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
