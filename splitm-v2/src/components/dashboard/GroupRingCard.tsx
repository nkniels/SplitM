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
 * Calculates clock positions for avatars ringed around the card border.
 * Maps up to 7 members to precise clock positions (12, 2, 4, 6, 8, 10 or 7-point ring).
 */
function getClockCoordinates(index: number, total: number) {
  if (total <= 6) {
    const clock6 = [
      { left: '50%', top: '0%' },    // 12 o'clock (top center)
      { left: '95%', top: '20%' },   // 2 o'clock (top right corner)
      { left: '95%', top: '80%' },   // 4 o'clock (bottom right corner)
      { left: '50%', top: '100%' },  // 6 o'clock (bottom center)
      { left: '5%', top: '80%' },    // 8 o'clock (bottom left corner)
      { left: '5%', top: '20%' },    // 10 o'clock (top left corner)
    ];
    return clock6[index % clock6.length];
  }

  // 7 members evenly distributed along perimeter
  const clock7 = [
    { left: '50%', top: '0%' },    // 12:00
    { left: '90%', top: '16%' },   // 1:45
    { left: '97%', top: '56%' },   // 3:30
    { left: '78%', top: '98%' },   // 5:15
    { left: '22%', top: '98%' },   // 6:45
    { left: '3%', top: '56%' },    // 8:30
    { left: '10%', top: '16%' },   // 10:15
  ];
  return clock7[index % clock7.length];
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
    const coords = getClockCoordinates(index, group.members.length);
    const leftPct = parseFloat(coords.left);
    const topPct = parseFloat(coords.top);

    if (leftPct > 60) {
      setPopoverCoords({ right: '12px', top: `${Math.min(topPct, 65)}%` });
    } else if (leftPct < 40) {
      setPopoverCoords({ left: '12px', top: `${Math.min(topPct, 65)}%` });
    } else {
      setPopoverCoords({ left: '50%', top: topPct > 50 ? '30%' : '20%' });
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
          ? 'cursor-default my-3'
          : 'cursor-pointer my-2 opacity-85 hover:opacity-100 hover:scale-[1.01]'
      } ${className}`}
    >
      {/* Outer Padding Ring to house avatars sitting on the card perimeter */}
      <div className={`relative px-3 ${isActive ? 'pt-7 pb-7' : 'pt-5 pb-5'}`}>
        {/* The Card Body (phone-shaped rounded rectangle from sketch) */}
        <div
          className={`relative w-full rounded-3xl bg-surface border transition-all duration-200 overflow-hidden ${
            isActive
              ? 'border-border shadow-md py-8 px-6 min-h-[260px]'
              : 'border-border-subtle bg-surface/85 py-6 px-5 min-h-[190px]'
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
                          Pooled MoMo
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
        </div>

        {/* Member Avatars Ringed Around the Card Perimeter (Clock Positions) */}
        {group.members.map((member, index) => {
          const coords = getClockCoordinates(index, group.members.length);
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
                  ? 'w-9 h-9 sm:w-10 sm:h-10 text-xs'
                  : 'w-7 h-7 sm:w-8 sm:h-8 text-[10px] opacity-80'
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
