import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusCircle, Users } from 'lucide-react';
import type { RootState, AppDispatch } from '../core/store/store';
import { loadGroups, loadMembersThunk } from '../modules/groups/group.thunks';
import { loadExpenses } from '../modules/expenses/expense.thunks';
import { setGroups, setMembers } from '../modules/groups/group.slice';
import { setExpenses } from '../modules/expenses/expense.slice';
import { subscribeToUserGroups, subscribeToGroupMembers } from '../modules/groups/group.service';
import { subscribeToGroupExpenses } from '../modules/expenses/expense.service';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import GroupForm from '../components/groups/GroupForm';
import MembersPanel from '../components/groups/MembersPanel';
import { SettlementsView } from '../components/settlements/SettlementsView';
import { Button } from '../components/ui/Button';
import { cn } from '../core/utils/helpers';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const groups = useSelector((state: RootState) => state.groups.groups);
  const activeGroupId = useSelector((state: RootState) => state.groups.activeGroupId);
  const members = useSelector((state: RootState) => state.groups.members);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);

  // Load groups on mount and subscribe to real-time updates from Firestore
  useEffect(() => {
    void dispatch(loadGroups());
    if (currentUser?.uid) {
      const unsub = subscribeToUserGroups(currentUser.uid, (freshGroups) => {
        dispatch(setGroups(freshGroups));
      });
      return () => unsub();
    }
  }, [dispatch, currentUser?.uid]);

  // When active group changes, load its expenses and members with real-time listeners
  useEffect(() => {
    if (activeGroupId) {
      void dispatch(loadExpenses(activeGroupId));
      void dispatch(loadMembersThunk(activeGroupId));

      const unsubExpenses = subscribeToGroupExpenses(activeGroupId, (freshExpenses) => {
        dispatch(setExpenses(freshExpenses));
      });

      const unsubMembers = subscribeToGroupMembers(activeGroupId, (freshMembers) => {
        dispatch(setMembers(freshMembers));
      });

      return () => {
        unsubExpenses();
        unsubMembers();
      };
    }
  }, [dispatch, activeGroupId]);

  const activeGroup = activeGroupId ? groups[activeGroupId] : undefined;
  const activeMembers = activeGroupId

    ? Object.values(members).filter((m) => m.groupId === activeGroupId)
    : [];

  const hasGroups = Object.keys(groups).length > 0;

  // Budget tracking
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const totalSpent = useMemo(() => {
    if (!activeGroupId) return 0;
    return Object.values(expenses)
      .filter(e => e.groupId === activeGroupId && !e.settled)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, activeGroupId]);
  const budget = activeGroup?.budget ?? 0;
  const budgetPct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const overBudget = budget > 0 && totalSpent > budget;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {activeGroup ? activeGroup.name : 'Dashboard'}
          </h1>
          {activeGroup?.description && (
            <p className="text-slate-500 text-sm mt-0.5">{activeGroup.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeGroup && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Users className="h-4 w-4" />}
              onClick={() => setShowMembersPanel(true)}
            >
              Members
            </Button>
          )}
          {activeGroup && activeMembers.length > 0 && (
            <Button
              variant="primary"
              leftIcon={<PlusCircle className="h-4 w-4" />}
              onClick={() => setShowExpenseForm(true)}
            >
              Add Expense
            </Button>
          )}
        </div>
      </div>

      {/* Budget indicator */}
      {activeGroup && budget > 0 && (
        <div className="bg-surface border border-slate-700 rounded-lg px-4 py-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Budget</span>
            <span className={cn('text-xs font-semibold', overBudget ? 'text-danger' : 'text-slate-300')}>
              {activeGroup.currency} {totalSpent.toFixed(2)} / {budget.toFixed(2)}
              {overBudget && ' — over budget!'}
            </span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', overBudget ? 'bg-danger' : 'bg-primary')}
              style={{ width: `${budgetPct}%` }}
              role="progressbar"
              aria-valuenow={Math.round(budgetPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${Math.round(budgetPct)}% of budget used`}
            />
          </div>
        </div>
      )}

      {/* No groups state */}
      {!hasGroups && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-slate-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Welcome to SplitM</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            Create a group to start splitting expenses with friends, family, or coworkers.
          </p>
          <Button variant="primary" onClick={() => setShowGroupForm(true)}>
            Create your first group
          </Button>
        </div>
      )}

      {/* Group exists but no members */}
      {activeGroup && activeMembers.length === 0 && (
        <div className="bg-surface border border-slate-700 rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-200 font-medium">Add members to start tracking expenses</p>
            <p className="text-slate-500 text-sm mt-0.5">
              Invite people to this group before adding expenses.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Users className="h-4 w-4" />}
            onClick={() => setShowMembersPanel(true)}
          >
            Manage Members
          </Button>
        </div>
      )}

      {/* Expense list + Settlements panel */}
      {activeGroup && activeMembers.length > 0 && activeGroupId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ExpenseList
              groupId={activeGroupId}
              currency={activeGroup.currency}
              members={activeMembers}
              onAddExpense={() => setShowExpenseForm(true)}
            />
          </div>
          <div>
            <SettlementsView />
          </div>
        </div>
      )}

      {/* Add Expense modal */}
      {showExpenseForm && activeGroupId && (
        <ExpenseForm
          groupId={activeGroupId}
          members={activeMembers}
          onClose={() => setShowExpenseForm(false)}
        />
      )}

      {/* Create Group modal */}
      {showGroupForm && (
        <GroupForm onClose={() => setShowGroupForm(false)} />
      )}

      {/* Members panel modal */}
      {showMembersPanel && activeGroupId && (
        <MembersPanel onClose={() => setShowMembersPanel(false)} />
      )}
    </div>
  );
}
