import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Expense } from '../../core/types';

export interface ExpenseState {
  expenses: Record<string, Expense>; // key is expenseId
}

const initialState: ExpenseState = {
  expenses: {},
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses(state, action: PayloadAction<Expense[]>) {
      action.payload.forEach(expense => {
        state.expenses[expense.id] = expense;
      });
    },
    addExpense(state, action: PayloadAction<Expense>) {
      state.expenses[action.payload.id] = action.payload;
    },
    updateExpense(state, action: PayloadAction<Expense>) {
      if (state.expenses[action.payload.id]) {
        state.expenses[action.payload.id] = {
          ...state.expenses[action.payload.id],
          ...action.payload
        };
      }
    },
    removeExpense(state, action: PayloadAction<string>) {
      delete state.expenses[action.payload];
    }
  }
});

export const { setExpenses, addExpense, updateExpense, removeExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
