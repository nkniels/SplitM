import React, { useState } from 'react';
import { UsersThree, Plus, Link, CaretRight, CheckCircle } from '@phosphor-icons/react';
import type { GroupCardData } from '../dashboard/GroupRingCard';
import type { Locale } from '../../i18n/addFlow.i18n';
import { addFlowTranslations } from '../../i18n/addFlow.i18n';
import { triggerHaptic } from '../../core/utils/haptics';

interface StepChooseGroupProps {
  groups: GroupCardData[];
  selectedGroupId?: string;
  locale: Locale;
  onSelectGroup: (group: GroupCardData) => void;
  onCreateNewGroup: () => void;
  onJoinWithLink: () => void;
}

export const StepChooseGroup: React.FC<StepChooseGroupProps> = ({
  groups,
  selectedGroupId,
  locale,
  onSelectGroup,
  onCreateNewGroup,
  onJoinWithLink,
}) => {
  const t = addFlowTranslations[locale];
  // Developer convenience toggle to test and screenshot the empty state even with mock groups
  const [forceEmptyState, setForceEmptyState] = useState(false);

  const displayedGroups = forceEmptyState ? [] : groups;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-xl w-full mx-auto animate-fade-in">
      {/* Title & Subtitle */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium text-primary tracking-tight">
            {t.step1Title}
          </h2>
          <p className="text-sm text-muted font-sans mt-0.5">
            {t.step1Subtitle}
          </p>
        </div>

        {/* Subtle QA Empty State Preview Switch */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setForceEmptyState(!forceEmptyState);
          }}
          className="text-[11px] font-sans px-2.5 py-1 rounded-full border border-border text-muted hover:text-primary transition-colors min-h-[32px] flex items-center"
          title="Toggle preview between populated and empty states"
        >
          {forceEmptyState ? 'Preview Populated' : 'Preview Empty'}
        </button>
      </div>

      {displayedGroups.length === 0 ? (
        /* Empty State */
        <div
          className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-3xl border border-dashed border-border bg-surface-elevated/40"
          role="region"
          aria-label={t.noGroupsTitle}
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
            <UsersThree size={32} weight="duotone" />
          </div>

          <h3 className="font-serif text-lg font-medium text-primary">
            {t.noGroupsTitle}
          </h3>
          <p className="text-xs sm:text-sm text-muted font-sans max-w-sm mt-1.5 mb-6">
            {t.noGroupsDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onCreateNewGroup();
              }}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl bg-accent text-white font-sans font-medium text-sm hover:bg-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus size={18} weight="bold" />
              {t.createGroupBtn}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onJoinWithLink();
              }}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl border border-border bg-surface text-primary font-sans font-medium text-sm hover:bg-surface-elevated active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Link size={18} weight="duotone" />
              {t.joinWithLinkBtn}
            </button>
          </div>
        </div>
      ) : (
        /* Populated Groups List */
        <div className="flex-1 flex flex-col space-y-3 overflow-y-auto pr-0.5">
          {displayedGroups.map((group) => {
            const isSelected = group.id === selectedGroupId;
            const members = group.members || [];
            const displayAvatars = members.slice(0, 4);
            const extraCount = Math.max(0, members.length - 4);

            return (
              <div
                key={group.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectGroup(group);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectGroup(group);
                  }
                }}
                className={`min-h-[72px] p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer active:scale-[0.99] select-none ${
                  isSelected
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                    : 'border-border bg-surface hover:border-accent/40 hover:bg-surface-elevated'
                }`}
              >
                {/* Left: Group Info */}
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-medium text-primary truncate">
                      {group.name}
                    </h3>
                    {isSelected && (
                      <CheckCircle size={18} weight="fill" className="text-accent shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-muted font-sans mt-0.5">
                    {t.membersCount.replace('{count}', String(members.length))}
                    {group.category ? ` • ${group.category}` : ''}
                  </p>
                </div>

                {/* Right: Avatar Stack & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex -space-x-2 overflow-hidden items-center">
                    {displayAvatars.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-surface bg-border overflow-hidden shrink-0"
                        title={m.name}
                      >
                        {m.avatarUrl ? (
                          <img
                            src={m.avatarUrl}
                            alt={m.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback on image load error
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-muted bg-surface-elevated">
                            {m.initials || m.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                    {extraCount > 0 && (
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-surface bg-surface-elevated text-[10px] font-bold text-muted">
                        +{extraCount}
                      </div>
                    )}
                  </div>

                  <CaretRight size={18} weight="bold" className="text-muted" />
                </div>
              </div>
            );
          })}

          {/* "+ New group" row at the bottom */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onCreateNewGroup();
            }}
            className="min-h-[52px] w-full p-3.5 rounded-2xl border border-dashed border-border hover:border-accent/50 bg-surface/50 hover:bg-surface text-primary font-sans font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2"
          >
            <Plus size={18} weight="bold" className="text-accent" />
            <span>{t.newGroupRow}</span>
          </button>
        </div>
      )}
    </div>
  );
};
