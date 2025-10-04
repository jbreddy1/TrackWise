import { Expense, Budget, User } from "@/types/expense";

const STORAGE_KEYS = {
  USER: "trackwise_user",
  EXPENSES: "trackwise_expenses",
  BUDGETS: "trackwise_budgets",
  EMERGENCY_FUND: "trackwise_emergency_fund",
  GAMIFICATION: "trackwise_gamification",
};

const getUserKey = (baseKey: string, userId?: string): string => {
  const currentUserId = userId || getUser()?.id;
  return currentUserId ? `${baseKey}_${currentUserId}` : baseKey;
};

// User Storage
export const saveUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const clearUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Expenses Storage
export const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(getUserKey(STORAGE_KEYS.EXPENSES), JSON.stringify(expenses));
};

export const getExpenses = (): Expense[] => {
  const expenses = localStorage.getItem(getUserKey(STORAGE_KEYS.EXPENSES));
  return expenses ? JSON.parse(expenses) : [];
};

export const addExpense = (expense: Expense) => {
  const expenses = getExpenses();
  expenses.unshift(expense);
  saveExpenses(expenses);
};

export const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...updatedExpense };
    saveExpenses(expenses);
  }
};

export const deleteExpense = (id: string) => {
  const expenses = getExpenses();
  saveExpenses(expenses.filter(e => e.id !== id));
};

// Budgets Storage
export const saveBudgets = (budgets: Budget[]) => {
  localStorage.setItem(getUserKey(STORAGE_KEYS.BUDGETS), JSON.stringify(budgets));
};

export const getBudgets = (): Budget[] => {
  const budgets = localStorage.getItem(getUserKey(STORAGE_KEYS.BUDGETS));
  return budgets ? JSON.parse(budgets) : [];
};

export const addBudget = (budget: Budget) => {
  const budgets = getBudgets();
  budgets.push(budget);
  saveBudgets(budgets);
};

export const updateBudget = (id: string, updatedBudget: Partial<Budget>) => {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === id);
  if (index !== -1) {
    budgets[index] = { ...budgets[index], ...updatedBudget };
    saveBudgets(budgets);
  }
};

export const deleteBudget = (id: string) => {
  const budgets = getBudgets();
  saveBudgets(budgets.filter(b => b.id !== id));
};
