import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReceiptText } from 'lucide-react';
import type { Expense, Member } from '../../core/types';
import type { RootState, AppDispatch } from '../../core/store/store';
import { loadExpenses, deleteExpenseThunk } from '../../modules/expenses/expense.thunks';
import { Skeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseDetail } from './ExpenseDetail';
import { ExpenseForm } from './ExpenseForm';

interface ExpenseListProps {
  groupId: string;
  currency: string;
  members: Member[];
  onAddExpense: () => void;
}

type FilterSettled = 'all' | 'settled' | 'unsettled';
type SortBy = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export function ExpenseList({ groupId, currency, members, onAddExpense }: ExpenseListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const allExpenses = useSelector((state: RootState) => state.expenses.expenses);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.uid);

  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSettled, setFilterSettled] = useState<FilterSettled>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToView, setExpenseToView] = useState<Expense | null>(null);

  useEffect(() => {
    setIsLoading(true);
    dispatch(loadExpenses(groupId)).finally(() => setIsLoading(false));
  }, [dispatch, groupId]);

  // All expenses for this group
  const groupExpenses = useMemo(
    () => Object.values(allExpenses).filter((e) => e.groupId === groupId),
    [allExpenses, groupId]
  );

  // Unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(groupExpenses.map((e) => e.category)));
    return cats.sort();
  }, [groupExpenses]);

  // Filtered + sorted
  const filteredExpenses = useMemo(() => {
    let list = groupExpenses;

    if (filterCategory !== 'all') {
      list = list.filter((e) => e.category === filterCategory);
    }

    if (filterSettled === 'settled') {
      list = list.filter((e) => e.settled);
    } else if (filterSettled === 'unsettled') {
      list = list.filter((e) => !e.settled);
    }

    const sorted = [...list];
    switch (sortBy) {
      case 'date-desc':
        sorted.sort((a, b) => b.date.localeCompare(a.date));
        break;
      case 'date-asc':
        sorted.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case 'amount-desc':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
    }
    return sorted;
  }, [groupExpenses, filterCategory, filterSettled, sortBy]);

  async function handleDeleteConfirm() {
    if (!expenseToDelete) return;
    await dispatch(deleteExpenseThunk(expenseToDelete.id));
    toast('Expense deleted', 'success');
    setExpenseToDelete(null);
  }

  const selectClass =
    'h-9 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  const settledButtonClass = (active: boolean) =>
    `h-9 px-3 text-sm rounded-md border transition-colors ${
      active
        ? 'bg-primary text-slate-900 border-primary font-medium'
        : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
    }`;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="Filter by category"
          className={selectClass}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Settled toggle */}
        <div className="flex items-center gap-1" role="group" aria-label="Filter by status">
          <button
            className={settledButtonClass(filterSettled === 'all')}
            onClick={() => setFilterSettled('all')}
          >
            All
          </button>
          <button
            className={settledButtonClass(filterSettled === 'unsettled')}
            onClick={() => setFilterSettled('unsettled')}
          >
            Unsettled
          </button>
          <button
            className={settledButtonClass(filterSettled === 'settled')}
            onClick={() => setFilterSettled('settled')}
          >
            Settled
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          aria-label="Sort expenses"
          className={selectClass}
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredExpenses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ReceiptText className="h-12 w-12 text-slate-600 mb-4" aria-hidden="true" />
          <p className="text-slate-300 font-medium text-lg">No expenses yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            Track your first shared expense
          </p>
          <Button variant="primary" onClick={onAddExpense}>
            Add Expense
          </Button>
        </div>
      )}

      {/* Expense cards */}
      {!isLoading && filteredExpenses.length > 0 && (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              members={members}
              currency={currency}
              isCreator={expense.createdBy === currentUserId}
              onClick={() => setExpenseToView(expense)}
              onEdit={() => setExpenseToEdit(expense)}
              onDelete={() => setExpenseToDelete(expense)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {expenseToDelete && (
        <Modal
          isOpen
          onClose={() => setExpenseToDelete(null)}
          title="Delete Expense"
        >
          <p className="text-slate-300 text-sm">
            Delete &ldquo;{expenseToDelete.description}&rdquo; ({currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
            {expenseToDelete.amount.toFixed(2)})?
          </p>
          <p className="text-slate-500 text-xs mt-1">This action cannot be undone.</p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setExpenseToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void handleDeleteConfirm()}>
              Delete
            </Button>
          </div>
        </Modal>
      )}

      {/* Expense detail */}
      {expenseToView && (
        <ExpenseDetail
          expense={expenseToView}
          members={members}
          currency={currency}
          onEdit={() => setExpenseToEdit(expenseToView)}
          onClose={() => setExpenseToView(null)}
        />
      )}

      {/* Expense edit form */}
      {expenseToEdit && (
        <ExpenseForm
          groupId={groupId}
          members={members}
          expenseToEdit={expenseToEdit}
          onClose={() => setExpenseToEdit(null)}
        />
      )}
    </div>
  );
}
