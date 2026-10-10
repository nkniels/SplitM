import React, { useState } from 'react';
import { CaretRight, Wallet, ShareNetwork } from '@phosphor-icons/react';
import { MemberBalancePopover, type RingMember } from './MemberBalancePopover';
import { triggerHaptic } from '../../core/utils/haptics';

export interface GroupCardData {
  id: string;
  name: string;
  category: string;
  summaryText: string;
  userBalanceType: 'owes' | 'owed' | 'settled';
  userBalanceAmount: number;
  totalExpenses: number;
  pooledCollected?: number;
  pooledTarget?: number;
  members: RingMember[];
}

interface GroupRingCardProps {
  group: GroupCardData;
  isActive: boolean;
  onSelectGroup?: (groupId: string) => void;
  onOpenPooledDrawer?: (group: GroupCardData) => void;
  onShareReceipt?: (group: GroupCardData) => void;
  onSettleMember?: (member: RingMember) => void;
  className?: string;
}

/**
 * Calculates positions for avatars floating strictly INSIDE the card border lines.
 * Places members along the inner perimeter with safe margins from the borders.
 */
function getInnerCardCoordinates(index: number, total: number, isActive: boolean) {
  if (!isActive) {
    // Inactive card: compact inner corner coordinates
    const inactiveCoords = [
      { left: '16%', top: '30%' },
      { left: '84%', top: '30%' },
      { left: '84%', top: '70%' },
      { left: '16%', top: '70%' },
      { left: '50%', top: '22%' },
      { left: '50%', top: '78%' },
    ];
    return inactiveCoords[index % inactiveCoords.length];
  }

  if (total <= 6) {
    const clock6Inside = [
      { left: '14%', top: '24%' },  // 10 o'clock (upper-left)
      { left: '50%', top: '16%' },  // 12 o'clock (top center)
      { left: '86%', top: '24%' },  // 2 o'clock (upper-right)
      { left: '86%', top: '78%' },  // 4 o'clock (lower-right)
      { left: '50%', top: '86%' },  // 6 o'clock (bottom center)
      { left: '14%', top: '78%' },  // 8 o'clock (lower-left)
    ];
    return clock6Inside[index % clock6Inside.length];
  }

  // 7 members evenly distributed along the safe inner perimeter
  const clock7Inside = [
    { left: '14%', top: '24%' },
    { left: '50%', top: '15%' },
    { left: '86%', top: '24%' },
    { left: '88%', top: '56%' },
    { left: '74%', top: '84%' },
    { left: '26%', top: '84%' },
    { left: '12%', top: '56%' },
  ];
  return clock7Inside[index % clock7Inside.length];
}

export const GroupRingCard: React.FC<GroupRingCardProps> = ({
  group,
  isActive,
  onSelectGroup,
  onOpenPooledDrawer,
  onShareReceipt,
  onSettleMember,
  className = '',
}) => {
  const [selectedMember, setSelectedMember] = useState<RingMember | null>(null);
  const [popoverCoords, setPopoverCoords] = useState<{ left?: string; top?: string; right?: string }>({});

  const handleAvatarClick = (e: React.MouseEvent, member: RingMember, index: number) => {
    e.stopPropagation();
    triggerHaptic('light');
    if (selectedMember?.id === member.id) {
      setSelectedMember(null);
      return;
    }

    // Determine smart popover placement depending on avatar side
    const coords = getInnerCardCoordinates(index, group.members.length, isActive);
    const leftPct = parseFloat(coords.left);
    const topPct = parseFloat(coords.top);

    if (leftPct > 60) {
      setPopoverCoords({ right: '16px', top: `${Math.min(Math.max(topPct - 10, 15), 55)}%` });
    } else if (leftPct < 40) {
      setPopoverCoords({ left: '16px', top: `${Math.min(Math.max(topPct - 10, 15), 55)}%` });
    } else {
      setPopoverCoords({ left: '50%', top: topPct > 50 ? '25%' : '55%' });
    }

    setSelectedMember(member);
  };

  const handleCardClick = () => {
    setSelectedMember(null);
    if (!isActive && onSelectGroup) {
      triggerHaptic('tear');
      onSelectGroup(group.id);
    }
  };

  const hasPooled = Boolean(group.pooledTarget && group.pooledTarget > 0);
  const pooledPct = hasPooled
    ? Math.min(100, Math.round(((group.pooledCollected ?? 0) / (group.pooledTarget ?? 1)) * 100))
    : 0;

  return (
    <div
      onClick={handleCardClick}
      className={`relative w-full select-none transition-all duration-200 ${
        isActive
          ? 'cursor-default my-2'
          : 'cursor-pointer my-1.5 opacity-90 hover:opacity-100 hover:scale-[1.008]'
      } ${className}`}
    >
      {/* The Card Body — Avatars float strictly inside its borders */}
      <div
        className={`relative w-full rounded-3xl bg-surface border transition-all duration-200 ${
          isActive
            ? 'border-border shadow-lg py-8 px-6 min-h-[290px]'
            : 'border-border-subtle bg-surface/90 py-5 px-5 min-h-[175px]'
        }`}
      >
          {/* Subtle Top Perforation Watermark */}
          <div className="absolute top-2 left-6 right-6 flex items-center justify-between text-[10px] font-mono tracking-widest text-muted/60 uppercase">
            <span>{group.category}</span>
            <div className="flex items-center gap-2">
              {isActive && onShareReceipt && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onShareReceipt(group);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-muted hover:text-accent transition-colors py-0.5 px-2 rounded-lg bg-surface hover:bg-surface-hover border border-border-subtle shadow-xs"
                  title="Share Group Receipt"
                >
                  <ShareNetwork size={11} weight="duotone" />
                  <span>SHARE</span>
                </button>
              )}
              <span>{isActive ? 'ACTIVE • 01' : 'TAP TO VIEW'}</span>
            </div>
          </div>

          {/* Centered Content: Group Name & Summary Text */}
          <div className="flex flex-col items-center justify-center text-center mt-2">
            <h2
              className={`font-serif tracking-tight text-primary transition-colors ${
                isActive ? 'text-2xl sm:text-3xl font-medium' : 'text-xl font-normal'
              }`}
            >
              {group.name}
            </h2>

            {/* One-line summary text */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-border-subtle text-xs font-medium">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  group.userBalanceType === 'owed'
                    ? 'bg-success'
                    : group.userBalanceType === 'owes'
                    ? 'bg-accent'
                    : 'bg-muted'
                }`}
              />
              <span
                className={
                  group.userBalanceType === 'owed'
                    ? 'text-success font-semibold tabular-nums'
                    : group.userBalanceType === 'owes'
                    ? 'text-accent font-semibold tabular-nums'
                    : 'text-muted tabular-nums'
                }
              >
                {group.summaryText}
              </span>
            </div>

            {/* Active Card Financial Details (Split Expenses + Pooled MoMo) */}
            {isActive && (
              <div className="w-full mt-6 pt-4 border-t border-dashed border-border-subtle">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-2.5 rounded-xl bg-background/50 border border-border-subtle">
                    <span className="text-[10px] text-muted uppercase tracking-wider block font-mono">
                      Total Ledger
                    </span>
                    <span className="text-sm font-semibold text-primary font-mono tabular-nums">
                      {group.totalExpenses.toLocaleString('en-US')} XAF
                    </span>
                  </div>

                  {hasPooled ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('medium');
                        onOpenPooledDrawer?.(group);
                      }}
                      className="p-2.5 rounded-xl bg-background/50 hover:bg-background/80 border border-border-subtle hover:border-accent text-left transition-all active:scale-[0.98] group/pot"
                    >
                      <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider font-mono">
                        <span className="flex items-center gap-1">
                          <Wallet size={11} weight="duotone" className="text-accent group-hover/pot:scale-110 transition-transform" />
                          Pool Money
                        </span>
                        <span className="tabular-nums font-bold text-accent">{pooledPct}%</span>
                      </div>
                      <span className="text-xs font-semibold text-primary font-mono tabular-nums block mt-0.5">
                        {(group.pooledCollected ?? 0).toLocaleString('en-US')} / {(group.pooledTarget ?? 0).toLocaleString('en-US')}
                      </span>
                      {/* Mini progress bar */}
                      <div className="w-full h-1 bg-border rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-300"
                          style={{ width: `${pooledPct}%` }}
                        />
                      </div>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-background/50 border border-border-subtle">
                      <span className="text-[10px] text-muted uppercase tracking-wider block font-mono">
                        Active Members
                      </span>
                      <span className="text-sm font-semibold text-primary font-mono tabular-nums">
                        {group.members.length} members
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inactive card quick teaser */}
            {!isActive && (
              <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted hover:text-primary transition-colors">
                <span>View debt ledger & members</span>
                <CaretRight size={12} weight="duotone" />
              </div>
            )}
          </div>

        {/* Member Avatars Floating Strictly INSIDE Card Border Lines */}
        {group.members.map((member, index) => {
          const coords = getInnerCardCoordinates(index, group.members.length, isActive);
          const isSelected = selectedMember?.id === member.id;

          return (
            <button
              key={member.id}
              onClick={(e) => handleAvatarClick(e, member, index)}
              style={{
                left: coords.left,
                top: coords.top,
                transform: 'translate(-50%, -50%)',
              }}
              title={`${member.name} (${member.balanceXaf >= 0 ? '+' : ''}${member.balanceXaf} XAF)`}
              className={`absolute z-10 ${
                isActive
                  ? 'w-10 h-10 sm:w-11 sm:h-11 text-xs'
                  : 'w-7 h-7 sm:w-8 sm:h-8 text-[10px] opacity-85'
              } rounded-full bg-surface-elevated border-2 flex items-center justify-center shadow-md transition-all duration-150 active:scale-95 ${
                isSelected
                  ? 'border-accent scale-110 ring-2 ring-accent/30'
                  : 'border-border hover:border-primary/50 hover:scale-105'
              }`}
              aria-label={`View details for ${member.name}`}
            >
              {member.avatarUrl && (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  loading="lazy"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              {!member.avatarUrl && (
                <span className="text-xs font-semibold text-primary select-none">
                  {member.initials}
                </span>
              )}

              {/* Status micro-dot (green = is owed, orange/accent = owes) */}
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-surface ${
                  member.balanceXaf > 0
                    ? 'bg-success'
                    : member.balanceXaf < 0
                    ? 'bg-accent'
                    : 'bg-muted'
                }`}
              />
            </button>
          );
        })}

        {/* Inline Member Balance Popover */}
        {selectedMember && (
          <MemberBalancePopover
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
            onSettle={(m) => {
              setSelectedMember(null);
              onSettleMember?.(m);
            }}
            positionStyle={popoverCoords}
          />
        )}
      </div>
    </div>
  );
};

export default GroupRingCard;
