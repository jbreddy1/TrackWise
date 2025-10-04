import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { getBudgets, addBudget, deleteBudget, getExpenses } from "@/lib/storage";
import type { Budget as BudgetType, ExpenseCategory } from "@/types/expense";
import { Plus, Trash2, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { formatCurrency } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Other"
];

const Budget = () => {
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "" as ExpenseCategory,
    limit: "",
    period: "monthly" as "weekly" | "monthly",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = () => {
    const loadedBudgets = getBudgets();
    const expenses = getExpenses();
    
    // Calculate spent amount for each budget
    const budgetsWithSpent = loadedBudgets.map(budget => {
      const categoryExpenses = expenses.filter(exp => exp.category === budget.category);
      const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return { ...budget, spent };
    });
    
    setBudgets(budgetsWithSpent);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.limit) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newBudget: BudgetType = {
      id: Date.now().toString(),
      category: formData.category,
      limit: parseFloat(formData.limit),
      period: formData.period,
      spent: 0,
    };
    
    addBudget(newBudget);
    loadBudgets();
    setFormData({
      category: "" as ExpenseCategory,
      limit: "",
      period: "monthly",
    });
    setIsOpen(false);
    
    toast({
      title: "Budget created",
      description: "Your budget has been set successfully",
    });
  };

  const handleDelete = (id: string) => {
    deleteBudget(id);
    loadBudgets();
    toast({
      title: "Budget deleted",
      description: "The budget has been removed",
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "text-destructive";
    if (percentage >= 80) return "text-warning";
    return "text-success";
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Budget</h1>
            <p className="text-muted-foreground">Set and track your spending limits</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set New Budget</DialogTitle>
                <DialogDescription>
                  Create a spending limit for a category
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Budget Limit (₹)</Label>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => setFormData({ ...formData, period: value as "weekly" | "monthly" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-gradient-primary">
                  Create Budget
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {budgets.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No budgets set yet</p>
              <Button onClick={() => setIsOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = percentage >= 100;
              const isNearLimit = percentage >= 80;
              
              return (
                <Card key={budget.id} className="shadow-soft hover:shadow-medium transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {budget.category}
                          {isOverBudget && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </CardTitle>
                        <CardDescription className="capitalize">{budget.period}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Spent</span>
                        <span className={`text-sm font-semibold ${getProgressColor(percentage)}`}>
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-2"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-2xl font-bold ${getProgressColor(percentage)}`}>
                        {percentage.toFixed(0)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(budget.limit - budget.spent)} remaining
                      </span>
                    </div>
                    {isOverBudget && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive font-medium">
                          Over budget by {formatCurrency(budget.spent - budget.limit)}
                        </p>
                      </div>
                    )}
                    {isNearLimit && !isOverBudget && (
                      <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-sm text-warning font-medium">
                          Approaching budget limit
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Budget;
