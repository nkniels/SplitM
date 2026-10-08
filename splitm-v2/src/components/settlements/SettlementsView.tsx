import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { RootState } from '../../core/store/store';
import { FinanceEngine } from '../../core/finance/FinanceEngine';
import { cn } from '../../core/utils/helpers';

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return currency;
  }
}

export function SettlementsView() {
  const activeGroupId = useSelector((state: RootState) => state.groups.activeGroupId);
  const groups = useSelector((state: RootState) => state.groups.groups);
  const members = useSelector((state: RootState) => state.groups.members);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);

  const derivedGroup = useMemo(() => {
    if (!activeGroupId || !groups[activeGroupId]) return null;
    const baseGroup = groups[activeGroupId];
    const groupMembers = Object.values(members).filter(m => m.groupId === activeGroupId);
    const groupExpenses = Object.values(expenses).filter(e => e.groupId === activeGroupId);
    return { ...baseGroup, members: groupMembers, expenses: groupExpenses };
  }, [activeGroupId, groups, members, expenses]);

  const balances = useMemo(() => {
    if (!derivedGroup) return {};
    return FinanceEngine.calculateBalances(derivedGroup);
  }, [derivedGroup]);

  const settlements = useMemo(() => {
    return FinanceEngine.computeSettlements(balances);
  }, [balances]);

  const currency = derivedGroup?.currency ?? 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  const allSettled = Object.values(balances).every(b => Math.abs(b) < 0.01);

  if (!derivedGroup) return null;

  return (
    <div className="space-y-6">
      {/* Balances panel */}
      <div className="bg-surface border border-slate-700 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Balances</h2>
        {allSettled ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-2" aria-hidden="true" />
            <p className="text-slate-300 font-medium">All settled up!</p>
            <p className="text-slate-500 text-sm">Everyone is even.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {derivedGroup.members.map(member => {
              const balance = balances[member.id] ?? 0;
              if (Math.abs(balance) < 0.01) return null;
              const isOwed = balance > 0;
              return (
                <li
                  key={member.id}
                  className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0"
                >
                  <span className="text-slate-200 text-sm">{member.name}</span>
                  <span className={cn('font-semibold text-sm', isOwed ? 'text-success' : 'text-danger')}>
                    {isOwed ? 'is owed' : 'owes'} {currencySymbol}{Math.abs(balance).toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Settlements panel — only shown when there are outstanding debts */}
      {!allSettled && (
        <div className="bg-surface border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Settlements</h2>
          <ul className="space-y-2">
            {settlements.map((s, i) => {
              const fromMember = derivedGroup.members.find(m => m.id === s.from);
              const toMember = derivedGroup.members.find(m => m.id === s.to);
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 py-2 border-b border-slate-700/50 last:border-0"
                >
                  <span className="text-danger text-sm font-medium">
                    {fromMember?.name ?? 'Unknown'}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  <span className="text-success text-sm font-medium">
                    {toMember?.name ?? 'Unknown'}
                  </span>
                  <span className="ml-auto text-slate-200 text-sm font-semibold">
                    {currencySymbol}{s.amount.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
