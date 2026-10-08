import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Expense, Member, Payer, Split, SplitType } from '../../core/types';
import { FinanceEngine } from '../../core/finance/FinanceEngine';
import { saveExpenseThunk } from '../../modules/expenses/expense.thunks';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { PayerSection } from './PayerSection';
import { SplitConfigurator } from './SplitConfigurator';
import type { RootState, AppDispatch } from '../../core/store/store';

interface ExpenseFormProps {
  groupId: string;
  members: Member[];
  expenseToEdit?: Expense;
  onClose: () => void;
}

const CATEGORIES = ['Food', 'Transport', 'Accommodation', 'Activities', 'Entertainment', 'Other'] as const;
const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Other'] as const;

const selectInputClass =
  'flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors';

const textareaClass =
  'flex w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none';

export function ExpenseForm({ groupId, members, expenseToEdit, onClose }: ExpenseFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { toast } = useToast();

  const isEditing = !!expenseToEdit;

  // ── Field state ──────────────────────────────────────────────────────────
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('Other');
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

    // Reconstruct customValues from splits
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
      newErrors.description = 'Description is required.';
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number.';
    } else if (numAmount > 999999999.99) {
      newErrors.amount = 'Amount must be ≤ 999,999,999.99.';
    }

    if (!date) {
      newErrors.date = 'Date is required.';
    }

    const payerSum = payers.reduce((acc, p) => acc + p.amount, 0);
    if (Math.abs(payerSum - numAmount) > 0.01) {
      newErrors.payers = `Payer amounts (${payerSum.toFixed(2)}) must equal the total (${numAmount.toFixed(2)}).`;
    }

    if (splitType === 'percent') {
      const percentSum = Object.values(customValues).reduce((acc, v) => acc + v, 0);
      if (Math.abs(percentSum - 100) > 0.5) {
        newErrors.splits = `Percentages must sum to 100% (currently ${percentSum.toFixed(1)}%).`;
      }
    }

    if (splitType === 'custom') {
      const customSum = splits.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(customSum - numAmount) > 0.01) {
        newErrors.splits = `Custom amounts (${customSum.toFixed(2)}) must equal the total (${numAmount.toFixed(2)}).`;
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
      toast('Expense saved', 'success');
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

  function handleConfirmEdit() {
    setShowSettledWarning(false);
    void doSave();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const numAmount = parseFloat(amount) || 0;

  return (
    <>
      {/* Settled expense confirmation modal */}
      <Modal
        isOpen={showSettledWarning}
        onClose={() => setShowSettledWarning(false)}
        title="Edit Settled Expense"
      >
        <p className="text-slate-300 text-sm">
          This expense has been marked as settled. Editing it will affect the settlement calculations.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSettledWarning(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmEdit}
            isLoading={isSubmitting}
          >
            Edit Anyway
          </Button>
        </div>
      </Modal>

      {/* Main form modal */}
      <Modal
        isOpen={true}
        onClose={onClose}
        title={isEditing ? 'Edit Expense' : 'Add Expense'}
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Description — full width */}
            <div>
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={100}
                placeholder="What was this expense for?"
                error={errors.description}
              />
              <p className="mt-1 text-xs text-slate-500 text-right">{description.length}/100</p>
            </div>

            {/* Amount + Date — half width each */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="999999999.99"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  aria-label="Amount"
                  className={selectInputClass}
                />
                {errors.amount && (
                  <p className="mt-1 text-xs text-danger" role="alert">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="Date"
                  className={selectInputClass}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-danger" role="alert">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Category — full width */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Category"
                className={selectInputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Payment method — half width */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  aria-label="Payment method"
                  className={selectInputClass}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payer section — full width */}
            <div>
              <PayerSection
                members={members}
                payers={payers}
                totalAmount={numAmount}
                onChange={setPayers}
              />
              {errors.payers && (
                <p className="mt-1 text-xs text-danger" role="alert">{errors.payers}</p>
              )}
            </div>

            {/* Split configurator — full width */}
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">How to split?</p>
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
                <p className="mt-1 text-xs text-danger" role="alert">{errors.splits}</p>
              )}
            </div>

            {/* Comments — full width */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder="Optional notes..."
                aria-label="Comments"
                className={textareaClass}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
