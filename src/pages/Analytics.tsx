import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenses } from "@/lib/storage";
import { Expense } from "@/types/expense";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import Layout from "@/components/Layout";
import { BarChart3 } from "lucide-react";

const COLORS = [
  "hsl(200 95% 45%)",  // Primary
  "hsl(173 80% 40%)",  // Accent
  "hsl(142 76% 36%)",  // Success
  "hsl(38 92% 50%)",   // Warning
  "hsl(0 84% 60%)",    // Destructive
  "hsl(280 70% 55%)",  // Purple
  "hsl(25 90% 55%)",   // Orange
  "hsl(200 20% 50%)",  // Gray
];

const Analytics = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    const loadedExpenses = getExpenses();
    setExpenses(loadedExpenses);

    // Process category data
    const categoryMap = new Map<string, number>();
    loadedExpenses.forEach(exp => {
      const current = categoryMap.get(exp.category) || 0;
      categoryMap.set(exp.category, current + exp.amount);
    });
    
    const catData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
    setCategoryData(catData);

    // Process monthly data (last 6 months)
    const monthlyMap = new Map<string, number>();
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthlyMap.set(monthKey, 0);
    }

    loadedExpenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + exp.amount);
      }
    });

    const monthData = Array.from(monthlyMap.entries()).map(([name, amount]) => ({
      name,
      amount: parseFloat(amount.toFixed(2))
    }));
    setMonthlyData(monthData);
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgTransaction = expenses.length > 0 ? totalSpent / expenses.length : 0;

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Visualize your spending patterns</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{expenses.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${avgTransaction.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {expenses.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No data to display yet. Start tracking expenses to see analytics!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Distribution of your expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Monthly Trend</CardTitle>
                  <CardDescription>Last 6 months spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="amount" fill="hsl(200 95% 45%)" name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown Table */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Detailed view of spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryData
                    .sort((a, b) => b.value - a.value)
                    .map((cat, index) => {
                      const percentage = (cat.value / totalSpent) * 100;
                      return (
                        <div key={cat.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}% of total
                            </p>
                          </div>
                          <p className="text-lg font-bold">${cat.value.toFixed(2)}</p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
