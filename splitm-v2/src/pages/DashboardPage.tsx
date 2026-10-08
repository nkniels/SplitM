import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusCircle, Users } from 'lucide-react';
import type { RootState, AppDispatch } from '../core/store/store';
import { loadGroups } from '../modules/groups/group.thunks';
import { loadExpenses } from '../modules/expenses/expense.thunks';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import GroupForm from '../components/groups/GroupForm';
import { SettlementsView } from '../components/settlements/SettlementsView';
import { Button } from '../components/ui/Button';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  const groups = useSelector((state: RootState) => state.groups.groups);
  const activeGroupId = useSelector((state: RootState) => state.groups.activeGroupId);
  const members = useSelector((state: RootState) => state.groups.members);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  // Load groups on mount
  useEffect(() => {
    void dispatch(loadGroups());
  }, [dispatch]);

  // When active group changes, load its expenses
  useEffect(() => {
    if (activeGroupId) {
      void dispatch(loadExpenses(activeGroupId));
    }
  }, [dispatch, activeGroupId]);

  const activeGroup = activeGroupId ? groups[activeGroupId] : undefined;
  const activeMembers = activeGroupId
    ? Object.values(members).filter((m) => m.groupId === activeGroupId)
    : [];

  const hasGroups = Object.keys(groups).length > 0;

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
            onClick={() => {
              // Navigation to members management can be wired up in AppShell
              // For now open the group creation flow as a shortcut placeholder
            }}
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
    </div>
  );
}
