export type SplitType = 'equal' | 'proportional' | 'percent' | 'custom';
export type MemberStatus = 'normal' | 'good' | 'difficult';

export interface Member {
  id: string;
  groupId: string;
  name: string;
  status: MemberStatus;
  weight: number;
  avatar?: string;
}

export interface Payer {
  memberId: string;
  amount: number;
}

export interface Split {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number; // was totalAmount
  date: string; // ISO format YYYY-MM-DD
  paymentMethod: string;
  category: string;
  payers: Payer[];
  splits: Split[];
  splitType: SplitType;
  comments?: string;
  receiptUrl?: string;
  settled: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  currency: string;
  budget: number;
  members: Member[]; // Only populated in derived state for FinanceEngine
  expenses: Expense[]; // Only populated in derived state for FinanceEngine
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}
