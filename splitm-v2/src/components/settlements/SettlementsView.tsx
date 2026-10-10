import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  CheckCircle2, 
  ArrowRight, 
  Share2, 
  Copy, 
  Check, 
  DollarSign, 
  ExternalLink,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers
} from 'lucide-react';
import type { RootState, AppDispatch } from '../../core/store/store';
import { FinanceEngine } from '../../core/finance/FinanceEngine';
import { saveExpenseThunk } from '../../modules/expenses/expense.thunks';
import { useToast } from '../ui/Toast';
import { cn } from '../../core/utils/helpers';
import type { Expense } from '../../core/types';

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'CAD': return 'CA$';
    case 'AUD': return 'AU$';
    default: return currency;
  }
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SettlementsView() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const activeGroupId = useSelector((state: RootState) => state.groups.activeGroupId);
  const groups = useSelector((state: RootState) => state.groups.groups);
  const members = useSelector((state: RootState) => state.groups.members);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'settlements' | 'balances'>('settlements');
  const [settlingIndex, setSettlingIndex] = useState<number | null>(null);

  const derivedGroup = useMemo(() => {
    if (!activeGroupId || !groups[activeGroupId]) return null;
    const baseGroup = groups[activeGroupId];
    const groupMembers = Object.values(members).filter(m => m.groupId === activeGroupId);
    const groupExpenses = Object.values(expenses).filter(e => e.groupId === activeGroupId && !e.settled);
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

  // Group metrics
  const totalVolume = useMemo(() => {
    if (!derivedGroup?.expenses) return 0;
    return derivedGroup.expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [derivedGroup]);

  const totalOwedInGroup = useMemo(() => {
    return Object.values(balances)
      .filter(b => b > 0)
      .reduce((sum, b) => sum + b, 0);
  }, [balances]);

  const handleCopyNote = async (fromName: string, toName: string, amount: number, idx: number) => {
    const text = `SplitM Settlement: ${fromName} owes ${toName} ${currencySymbol}${amount.toFixed(2)} (${derivedGroup?.name ?? 'Group'})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      toast('Copied settlement note to clipboard', 'info');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast('Failed to copy note', 'error');
    }
  };

  const handleShare = async (fromName: string, toName: string, amount: number) => {
    const text = `Hey ${fromName}, please settle up ${currencySymbol}${amount.toFixed(2)} with ${toName} on SplitM!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SplitM: Settle ${currencySymbol}${amount.toFixed(2)}`,
          text
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast('Settlement request copied to clipboard', 'info');
    }
  };

  const handleRecordPayment = async (fromId: string, toId: string, amount: number, idx: number) => {
    if (!activeGroupId) return;
    setSettlingIndex(idx);

    const fromMember = derivedGroup?.members.find(m => m.id === fromId);
    const toMember = derivedGroup?.members.find(m => m.id === toId);

    const settlementExpense: Expense = {
      id: 'settle_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      groupId: activeGroupId,
      description: `Settlement: ${fromMember?.name ?? 'Member'} paid ${toMember?.name ?? 'Member'}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      category: 'Other',
      payers: [{ memberId: fromId, amount }],
      splits: [{ memberId: toId, amount }],
      splitType: 'custom',
      settled: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: fromId,
      comments: 'Direct debt settlement recorded in SplitM'
    };

    try {
      await dispatch(saveExpenseThunk(settlementExpense)).unwrap();
      toast(`Recorded ${currencySymbol}${amount.toFixed(2)} settlement!`, 'success');
    } catch {
      toast('Failed to record settlement', 'error');
    } finally {
      setSettlingIndex(null);
    }
  };

  if (!derivedGroup) return null;

  return (
    <div className="space-y-4">
      {/* Top Fintech Status Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-tight">Debt Simplifier</h2>
              <p className="text-xs text-slate-400">Optimal transaction engine</p>
            </div>
          </div>

          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('settlements')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'settlements'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Settlements ({settlements.length})
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'balances'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Balances
            </button>
          </div>
        </div>

        {/* Financial KPI bar */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">
              Pending Volume
            </span>
            <span className="font-mono text-base font-bold text-slate-100 tracking-tight">
              {currencySymbol}{totalOwedInGroup.toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">
              Efficiency
            </span>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
              <Layers className="h-3.5 w-3.5" />
              {settlements.length === 0 ? 'Zero Debts' : `${settlements.length} transfer${settlements.length > 1 ? 's' : ''} needed`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {allSettled ? (
        <div className="glass-card rounded-2xl p-8 border border-emerald-500/20 text-center relative overflow-hidden glow-success/20">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-1">All Settled Up!</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            All debts have been cleared. Every member's balance is exactly $0.00.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-xs font-mono text-emerald-300">
            Zero-Sum Ledger Verified
          </div>
        </div>
      ) : activeTab === 'settlements' ? (
        /* Settlement Paths View */
        <div className="space-y-3">
          {settlements.map((s, idx) => {
            const fromMember = derivedGroup.members.find(m => m.id === s.from);
            const toMember = derivedGroup.members.find(m => m.id === s.to);
            const isSettling = settlingIndex === idx;

            return (
              <div 
                key={`${s.from}-${s.to}-${idx}`}
                className="glass-card rounded-xl p-4 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-3">
                  {/* From Member */}
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xs font-bold text-rose-400">
                      {getInitials(fromMember?.name ?? 'U')}
                    </div>
                    <div>
                      <span className="text-xs text-rose-400 font-semibold block uppercase tracking-wider">Owes</span>
                      <span className="text-sm font-semibold text-slate-200">{fromMember?.name ?? 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Transfer Visual */}
                  <div className="flex flex-col items-center px-2">
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>

                  {/* To Member */}
                  <div className="flex items-center gap-2.5 text-right">
                    <div>
                      <span className="text-xs text-emerald-400 font-semibold block uppercase tracking-wider">Receives</span>
                      <span className="text-sm font-semibold text-slate-200">{toMember?.name ?? 'Unknown'}</span>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                      {getInitials(toMember?.name ?? 'U')}
                    </div>
                  </div>
                </div>

                {/* Amount & Quick Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-lg font-bold text-slate-100 tracking-tight">
                      {currencySymbol}{s.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyNote(fromMember?.name ?? '', toMember?.name ?? '', s.amount, idx)}
                      title="Copy payment note"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                      aria-label="Copy note"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShare(fromMember?.name ?? '', toMember?.name ?? '', s.amount)}
                      title="Share payment reminder"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                      aria-label="Share reminder"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      disabled={isSettling}
                      onClick={() => handleRecordPayment(s.from, s.to, s.amount, idx)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      {isSettling ? 'Recording...' : 'Mark Paid'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Net Balances List View */
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
          {derivedGroup.members.map(member => {
            const bal = balances[member.id] ?? 0;
            const isZero = Math.abs(bal) < 0.01;
            const isCreditor = bal > 0.01;

            return (
              <div 
                key={member.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold border',
                    isZero 
                      ? 'bg-slate-800 text-slate-400 border-slate-700' 
                      : isCreditor 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  )}>
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">{member.name}</span>
                    <span className="text-xs text-slate-500 capitalize">{member.status || 'Active'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={cn(
                    'font-mono text-sm font-bold block',
                    isZero 
                      ? 'text-slate-400' 
                      : isCreditor 
                        ? 'text-emerald-400' 
                        : 'text-rose-400'
                  )}>
                    {isZero ? `${currencySymbol}0.00` : isCreditor ? `+${currencySymbol}${bal.toFixed(2)}` : `-${currencySymbol}${Math.abs(bal).toFixed(2)}`}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isZero ? 'Settled' : isCreditor ? 'gets back' : 'owes'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
