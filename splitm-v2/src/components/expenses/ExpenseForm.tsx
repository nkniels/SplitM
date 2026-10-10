import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  DollarSign, 
  Users, 
  AlertCircle,
  Utensils,
  Car,
  Hotel,
  Ticket,
  Zap,
  Tag
} from 'lucide-react';
import type { Expense, Member, Payer, Split, SplitType } from '../../core/types';
import { FinanceEngine } from '../../core/finance/FinanceEngine';
import { saveExpenseThunk } from '../../modules/expenses/expense.thunks';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { PayerSection } from './PayerSection';
import { SplitConfigurator } from './SplitConfigurator';
import type { RootState, AppDispatch } from '../../core/store/store';
import { cn } from '../../core/utils/helpers';

interface ExpenseFormProps {
  groupId: string;
  members: Member[];
  expenseToEdit?: Expense;
  onClose: () => void;
}

const CATEGORIES = [
  { name: 'Food', icon: Utensils },
  { name: 'Transport', icon: Car },
  { name: 'Accommodation', icon: Hotel },
  { name: 'Activities', icon: Ticket },
  { name: 'Utilities', icon: Zap },
  { name: 'Other', icon: Tag },
] as const;

const PAYMENT_METHODS = ['Card', 'Cash', 'Bank Transfer', 'Revolut / Venmo'] as const;

export function ExpenseForm({ groupId, members, expenseToEdit, onClose }: ExpenseFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const activeGroup = useSelector((state: RootState) => 
    state.groups.activeGroupId ? state.groups.groups[state.groups.activeGroupId] : null
  );
  const { toast } = useToast();

  const isEditing = !!expenseToEdit;
  const currencySymbol = activeGroup?.currency === 'EUR' ? '€' : activeGroup?.currency === 'GBP' ? '£' : '$';

  // ── Field state ──────────────────────────────────────────────────────────
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('Food');
  const [paymentMethod, setPaymentMethod] = useState<string>('Card');
  const [comments, setComments] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customValues, setCustomValues] = useState<Record<string, number>>({});
  const [payers, setPayers] = useState<Payer[]>([{ memberId: members[0]?.id ?? '', amount: 0 }]);
  const [splits, setSplits] = useState<Split[]>([]);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [showSettledWarning, setShowSettledWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Pre-populate when editing ─────────────────────────────────────────────
  useEffect(() => {
    if (!expenseToEdit) return;

    const totalAmount = expenseToEdit.amount;

    setDescription(expenseToEdit.description);
    setAmount(String(expenseToEdit.amount));
    setDate(expenseToEdit.date);
    setCategory(expenseToEdit.category);
    setPaymentMethod(expenseToEdit.paymentMethod);
    setComments(expenseToEdit.comments ?? '');
    setSplitType(expenseToEdit.splitType);
    setPayers(expenseToEdit.payers);
    setSplits(expenseToEdit.splits);

    const type = expenseToEdit.splitType;
    if (type === 'percent') {
      const cv: Record<string, number> = Object.fromEntries(
        expenseToEdit.splits.map((s) => [s.memberId, totalAmount > 0 ? (s.amount / totalAmount) * 100 : 0])
      );
      setCustomValues(cv);
    } else if (type === 'custom') {
      const cv: Record<string, number> = Object.fromEntries(
        expenseToEdit.splits.map((s) => [s.memberId, s.amount])
      );
      setCustomValues(cv);
    } else {
      setCustomValues({});
    }
  }, [expenseToEdit]);

  // Keep single payer in sync with total amount if user hasn't created multiple payers
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    if (payers.length === 1) {
      setPayers([{ memberId: payers[0].memberId || (members[0]?.id ?? ''), amount: numAmount }]);
    }
  }, [amount, members]);

  // ── Recompute splits whenever amount/splitType/customValues/members change ─
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const computedSplits = FinanceEngine.distributeSplit(numAmount, members, splitType, customValues);
    setSplits(computedSplits);
  }, [amount, splitType, customValues, members]);

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    const numAmount = parseFloat(amount);

    if (!description.trim()) {
      newErrors.description = 'Please describe this expense (e.g. Dinner, Groceries).';
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Enter a valid amount greater than 0.';
    } else if (numAmount > 999999999.99) {
      newErrors.amount = 'Amount exceeds maximum limit.';
    }

    if (!date) {
      newErrors.date = 'Date is required.';
    }

    const payerSum = payers.reduce((acc, p) => acc + p.amount, 0);
    if (Math.abs(payerSum - numAmount) > 0.01) {
      newErrors.payers = `Paid sum (${currencySymbol}${payerSum.toFixed(2)}) must equal total (${currencySymbol}${numAmount.toFixed(2)}).`;
    }

    if (splitType === 'percent') {
      const percentSum = Object.values(customValues).reduce((acc, v) => acc + v, 0);
      if (Math.abs(percentSum - 100) > 0.5) {
        newErrors.splits = `Percentages must sum to 100% (currently ${percentSum.toFixed(1)}%).`;
      }
    }

    if (splitType === 'custom') {
      const customSum = splits.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(customSum - numAmount) > 0.02) {
        newErrors.splits = `Custom splits (${currencySymbol}${customSum.toFixed(2)}) must equal total (${currencySymbol}${numAmount.toFixed(2)}).`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function doSave() {
    setIsSubmitting(true);
    try {
      const numAmount = parseFloat(amount);
      const expense: Expense = {
        id: expenseToEdit?.id ?? crypto.randomUUID(),
        groupId,
        description: description.trim(),
        amount: numAmount,
        date,
        category,
        paymentMethod,
        comments: comments.trim() || undefined,
        payers,
        splits,
        splitType,
        settled: expenseToEdit?.settled ?? false,
        createdAt: expenseToEdit?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        createdBy: expenseToEdit?.createdBy ?? (user?.uid ?? ''),
      };

      await dispatch(saveExpenseThunk(expense)).unwrap();
      toast('Expense recorded successfully', 'success');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save expense.';
      toast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (expenseToEdit?.settled) {
      setShowSettledWarning(true);
      return;
    }
    void doSave();
  }

  const numAmount = parseFloat(amount) || 0;
  const perPersonAvg = members.length > 0 ? (numAmount / members.length).toFixed(2) : '0.00';

  return (
    <>
      {/* Settled warning modal */}
      <Modal
        isOpen={showSettledWarning}
        onClose={() => setShowSettledWarning(false)}
        title="Edit Settled Expense"
        subtitle="This expense was already settled in group balances"
      >
        <p className="text-slate-300 text-sm">
          Editing an already settled expense recalculates historical debts across all members. Do you wish to continue?
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => setShowSettledWarning(false)}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={() => { setShowSettledWarning(false); void doSave(); }} isLoading={isSubmitting}>
            Confirm Edit
          </Button>
        </div>
      </Modal>

      {/* Main Expense Form Modal */}
      <Modal
        isOpen={true}
        onClose={onClose}
        title={isEditing ? 'Edit Expense' : 'Add New Expense'}
        subtitle={`Splitting in ${activeGroup?.name ?? 'Group'}`}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Hero Amount Input Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group focus-within:border-primary/60 transition-colors">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              Total Amount
            </div>

            <div className="flex items-center justify-center gap-2 w-full max-w-xs">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-400 font-mono select-none">
                {currencySymbol}
              </span>
              <input
                type="number"
                min="0.01"
                max="999999999.99"
                step="0.01"
                autoFocus={!isEditing}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                aria-label="Expense Amount"
                className="w-full text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight bg-transparent text-center focus:outline-none placeholder:text-slate-700"
              />
            </div>

            {/* Live Per-Person Badge */}
            {numAmount > 0 && members.length > 0 && (
              <div className="mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-1.5 animate-fade-in">
                <Users className="w-3 h-3 text-emerald-400" />
                <span>≈ {currencySymbol}{perPersonAvg} / person</span>
                <span className="text-emerald-500">({members.length} members)</span>
              </div>
            )}

            {errors.amount && (
              <p className="mt-2 text-xs font-medium text-danger flex items-center gap-1 animate-fade-in" role="alert">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Description & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dinner, Uber, Airbnb reservation"
                maxLength={100}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
                  errors.description ? "border-danger" : "border-slate-800 focus:border-primary/50"
                )}
              />
              {errors.description && (
                <p className="text-xs text-danger">{errors.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category Chips Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Category</span>
              <span className="text-[11px] text-slate-400 font-normal">Selected: {category}</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all active:scale-95 group",
                      isSelected
                        ? "bg-primary/15 border-primary text-slate-100 shadow-sm shadow-primary/20"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    )}
                  >
                    <span className={cn(
                      "p-1.5 rounded-lg mb-1.5 transition-colors",
                      isSelected ? "bg-primary/25 text-indigo-300" : "bg-slate-800/80 text-slate-400 group-hover:text-slate-200"
                    )}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="truncate w-full text-center text-[11px] font-semibold">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Payment Method
            </label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-all active:scale-95",
                    paymentMethod === pm
                      ? "bg-slate-800 border-indigo-400 text-indigo-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  )}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Who Paid Section */}
          <div className="pt-2 border-t border-slate-800/80">
            <PayerSection
              members={members}
              payers={payers}
              totalAmount={numAmount}
              onChange={setPayers}
            />
            {errors.payers && (
              <p className="mt-1 text-xs text-danger font-medium">{errors.payers}</p>
            )}
          </div>

          {/* Split Rules Section */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Split Distribution
              </span>
              <span className="text-xs text-slate-400">
                Mode: <strong className="text-slate-200 capitalize">{splitType}</strong>
              </span>
            </div>

            <SplitConfigurator
              totalAmount={numAmount}
              members={members}
              splitType={splitType}
              onSplitTypeChange={(t) => {
                setSplitType(t);
                setCustomValues({});
              }}
              customValues={customValues}
              onCustomValuesChange={setCustomValues}
              splits={splits}
            />
            {errors.splits && (
              <p className="mt-1.5 text-xs text-danger font-medium">{errors.splits}</p>
            )}
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Notes / Receipt Memo (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={2}
              placeholder="Add payment details, receipt link, or notes..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Sticky Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80 sticky bottom-0 bg-surface/90 backdrop-blur-md py-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl px-5">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={isSubmitting}
              className="rounded-xl px-6 bg-primary hover:bg-primary-hover active:scale-95 shadow-lg shadow-primary/25 font-semibold"
            >
              {isEditing ? 'Save Changes' : 'Confirm Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
