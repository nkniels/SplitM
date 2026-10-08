import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Expense } from '../../core/types';
import { setExpenses, addExpense, updateExpense, removeExpense } from './expense.slice';
import { createExpense, updateExpenseInStore, deleteExpenseFromStore, loadExpensesForGroup } from './expense.service';
import type { RootState } from '../../core/store/store';

export const loadExpenses = createAsyncThunk(
  'expenses/loadExpenses',
  async (groupId: string, { dispatch }) => {
    const expenses = await loadExpensesForGroup(groupId);
    dispatch(setExpenses(expenses));
    return expenses;
  }
);

export const saveExpenseThunk = createAsyncThunk(
  'expenses/saveExpense',
  async (expense: Expense, { dispatch, getState }) => {
    // Optimistic update: dispatch to Redux first
    const state = getState() as RootState;
    const exists = state.expenses.expenses[expense.id];
    if (exists) {
      dispatch(updateExpense(expense));
      await updateExpenseInStore(expense);
    } else {
      dispatch(addExpense(expense));
      await createExpense(expense);
    }
    return expense;
  }
);

export const deleteExpenseThunk = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string, { dispatch }) => {
    // Optimistic delete
    dispatch(removeExpense(id));
    await deleteExpenseFromStore(id);
    return id;
  }
);
