import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../modules/auth/auth.slice';
import groupsReducer from '../../modules/groups/group.slice';
import expensesReducer from '../../modules/expenses/expense.slice';
import syncReducer from '../../modules/sync/sync.slice';

export const rootReducer = combineReducers({
  auth: authReducer,
  groups: groupsReducer,
  expenses: expensesReducer,
  sync: syncReducer,
});
