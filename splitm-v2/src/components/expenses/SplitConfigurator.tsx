import { cn } from '../../core/utils/helpers';
import type { Member, Split, SplitType } from '../../core/types';

interface SplitConfiguratorProps {
  totalAmount: number;
  members: Member[];
  splitType: SplitType;
  onSplitTypeChange: (t: SplitType) => void;
  customValues: Record<string, number>; // memberId -> value (percent or custom amount)
  onCustomValuesChange: (v: Record<string, number>) => void;
  splits: Split[]; // computed splits passed in from parent
}

const TABS: { key: SplitType; label: string }[] = [
  { key: 'equal', label: 'Equal' },
  { key: 'proportional', label: 'Proportional' },
  { key: 'percent', label: 'By %' },
  { key: 'custom', label: 'Custom' },
];

function AvatarCircle({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 text-slate-200 text-xs font-semibold shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function SplitConfigurator({
  totalAmount,
  members,
  splitType,
  onSplitTypeChange,
  customValues,
  onCustomValuesChange,
  splits,
}: SplitConfiguratorProps) {
  const scrollable = members.length > 5;

  function getSplitAmount(memberId: string): number {
    return splits.find((s) => s.memberId === memberId)?.amount ?? 0;
  }

  // ── percent tab helpers ──────────────────────────────────────────────────
  const percentSum = members.reduce(
    (acc, m) => acc + (customValues[m.id] ?? 0),
    0
  );
  const percentError =
    Math.abs(percentSum - 100) > 0.001
      ? 'Percentages must add up to 100%'
      : null;

  // ── custom tab helpers ───────────────────────────────────────────────────
  const customSum = members.reduce(
    (acc, m) => acc + (customValues[m.id] ?? 0),
    0
  );
  const customError =
    Math.abs(customSum - totalAmount) > 0.01
      ? 'Amounts must add up to the total'
      : null;

  function handleCustomValueChange(memberId: string, value: number) {
    onCustomValuesChange({ ...customValues, [memberId]: value });
  }

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div
        className="flex rounded-lg overflow-hidden border border-slate-700"
        role="tablist"
        aria-label="Split type"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={splitType === tab.key}
            onClick={() => onSplitTypeChange(tab.key)}
            className={cn(
              'flex-1 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
              splitType === tab.key
                ? 'bg-primary text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        className={cn(
          'space-y-1',
          scrollable && 'max-h-48 overflow-y-auto pr-1'
        )}
      >
        {/* ── Equal ─────────────────────────────────────────────────────── */}
        {splitType === 'equal' &&
          members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center py-1.5"
            >
              <div className="flex items-center gap-2">
                <AvatarCircle name={member.name} />
                <span className="text-sm text-slate-200">{member.name}</span>
              </div>
              <span className="text-sm text-slate-300 font-medium">
                ${getSplitAmount(member.id).toFixed(2)}
              </span>
            </div>
          ))}

        {/* ── Proportional ──────────────────────────────────────────────── */}
        {splitType === 'proportional' &&
          members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center py-1.5"
            >
              <div className="flex items-center gap-2">
                <AvatarCircle name={member.name} />
                <span className="text-sm text-slate-200">
                  {member.name}
                  <span className="ml-1 text-xs text-slate-500">
                    (weight: {member.weight})
                  </span>
                </span>
              </div>
              <span className="text-sm text-slate-300 font-medium">
                ${getSplitAmount(member.id).toFixed(2)}
              </span>
            </div>
          ))}

        {/* ── By % ──────────────────────────────────────────────────────── */}
        {splitType === 'percent' && (
          <>
            {members.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center py-1.5 gap-3"
              >
                <span className="text-sm text-slate-200 flex-1 min-w-0 truncate">
                  {member.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={customValues[member.id] ?? 0}
                    onChange={(e) =>
                      handleCustomValueChange(
                        member.id,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-label={`${member.name} percentage`}
                    className="w-20 h-8 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-right"
                  />
                  <span className="text-sm text-slate-400">%</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-700 mt-1">
              <p className="text-xs text-slate-400">
                Total: {percentSum.toFixed(1)}% / 100%
              </p>
              {percentError && (
                <p className="text-xs text-red-400 mt-0.5" role="alert">
                  {percentError}
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Custom ────────────────────────────────────────────────────── */}
        {splitType === 'custom' && (
          <>
            {members.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center py-1.5 gap-3"
              >
                <span className="text-sm text-slate-200 flex-1 min-w-0 truncate">
                  {member.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={customValues[member.id] ?? 0}
                    onChange={(e) =>
                      handleCustomValueChange(
                        member.id,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    aria-label={`${member.name} amount`}
                    className="w-24 h-8 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-right"
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-700 mt-1">
              <p className="text-xs text-slate-400">
                Sum: ${customSum.toFixed(2)} / ${totalAmount.toFixed(2)}
              </p>
              {customError && (
                <p className="text-xs text-red-400 mt-0.5" role="alert">
                  {customError}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
