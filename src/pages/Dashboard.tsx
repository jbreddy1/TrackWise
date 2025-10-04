import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getExpenses, getBudgets } from "@/lib/storage";
import { Expense, Budget } from "@/types/expense";
import { TrendingUp, TrendingDown, Wallet, Target, Plus, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { formatCurrency } from "@/lib/currency";

const Dashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    setExpenses(getExpenses());
    setBudgets(getBudgets());
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const thisMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  }).reduce((sum, exp) => sum + exp.amount, 0);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const budgetProgress = totalBudget > 0 ? (thisMonthExpenses / totalBudget) * 100 : 0;

  const recentExpenses = expenses.slice(0, 5);

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your expenses and manage your budget</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(thisMonthExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">Current month spending</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Budget Status
              </CardTitle>
              <Target className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetProgress.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(thisMonthExpenses)} of {formatCurrency(totalBudget)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Transactions
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total recorded</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your expenses and budgets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/expenses">
                <Button className="w-full justify-between bg-gradient-primary">
                  Add New Expense
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/budget">
                <Button variant="outline" className="w-full justify-between">
                  Set Budget
                  <Target className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="outline" className="w-full justify-between">
                  View Analytics
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No expenses yet. Add your first expense to get started!
                </p>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-xs text-muted-foreground">{expense.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-destructive">{formatCurrency(expense.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link to="/expenses">
                    <Button variant="ghost" className="w-full">
                      View All Expenses
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
