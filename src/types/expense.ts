export type ExpenseCategory = 
  | "Food" 
  | "Travel" 
  | "Bills" 
  | "Shopping" 
  | "Entertainment" 
  | "Health" 
  | "Education" 
  | "Other";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  limit: number;
  period: "weekly" | "monthly";
  spent: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
