import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGamificationData, updateEmergencyFund } from "@/lib/gamification";
import { GamificationData } from "@/types/gamification";
import { getExpenses, getUser } from "@/lib/storage";
import Layout from "@/components/Layout";
import { Trophy, Flame, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

const Rewards = () => {
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [emergencyAmount, setEmergencyAmount] = useState("");
  const user = getUser();

  useEffect(() => {
    const data = getGamificationData(user?.id);
    setGamification(data);
    setEmergencyAmount(data.emergencyFund.amount.toString());

    // Calculate monthly expenses
    const expenses = getExpenses();
    const now = new Date();
    const monthlyExpenses = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    if (monthlyExpenses > 0) {
      updateEmergencyFund(data.emergencyFund.amount, monthlyExpenses, user?.id);
      setGamification(getGamificationData(user?.id));
    }
  }, [user?.id]);

  const handleUpdateEmergency = () => {
    const amount = parseFloat(emergencyAmount) || 0;
    const expenses = getExpenses();
    const now = new Date();
    const monthlyExpenses = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    updateEmergencyFund(amount, monthlyExpenses, user?.id);
    setGamification(getGamificationData(user?.id));
  };

  if (!gamification) return null;

  const survivalDays = gamification.emergencyFund.monthlyExpenses > 0
    ? Math.floor((gamification.emergencyFund.amount / gamification.emergencyFund.monthlyExpenses) * 30)
    : 0;

  const survivalMonths = gamification.emergencyFund.monthlyExpenses > 0
    ? (gamification.emergencyFund.amount / gamification.emergencyFund.monthlyExpenses).toFixed(1)
    : "0";

  const burnRate = gamification.emergencyFund.monthlyExpenses / 30;
  const isEmergency = survivalDays < 30;

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold mb-2">Rewards & Safety</h1>
          <p className="text-muted-foreground">Track your progress and emergency fund</p>
        </div>

        {/* Emergency Fund Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Emergency Fund</CardTitle>
              </div>
              <CardDescription>Your financial safety net</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergency-amount">Emergency Fund Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="emergency-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={emergencyAmount}
                    onChange={(e) => setEmergencyAmount(e.target.value)}
                  />
                  <Button onClick={handleUpdateEmergency}>Update</Button>
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                  <span className="text-sm font-medium">Current Fund</span>
                  <span className="font-bold text-primary">{formatCurrency(gamification.emergencyFund.amount)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">Survival Days</span>
                  <span className="font-bold">{survivalDays} days</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">Survival Months</span>
                  <span className="font-bold">{survivalMonths} months</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">Daily Burn Rate</span>
                  <span className="font-bold text-destructive">{formatCurrency(burnRate)}/day</span>
                </div>

                {isEmergency && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">⚠️ Emergency Alert</p>
                      <p className="text-sm text-muted-foreground">Your emergency fund is below 1 month. Consider reducing expenses.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-warning" />
                <CardTitle>Tracking Streak</CardTitle>
              </div>
              <CardDescription>Keep the momentum going</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-warning mb-2">
                    {gamification.streak.currentStreak}
                  </div>
                  <p className="text-muted-foreground">Day Streak</p>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">Longest Streak</span>
                  <span className="font-bold">{gamification.streak.longestStreak} days</span>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Track expenses daily to maintain your streak
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              <CardTitle>Badges & Achievements</CardTitle>
            </div>
            <CardDescription>Your financial milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {gamification.badges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Start tracking expenses to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gamification.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 rounded-lg bg-gradient-primary text-center space-y-2"
                  >
                    <div className="text-4xl">{badge.icon}</div>
                    <div>
                      <p className="font-bold text-primary-foreground">{badge.name}</p>
                      <p className="text-xs text-primary-foreground/80">{badge.description}</p>
                      {badge.earnedAt && (
                        <p className="text-xs text-primary-foreground/60 mt-1">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Available Badges */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Available Badges</CardTitle>
            <CardDescription>Complete challenges to unlock these badges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { id: "first-expense", name: "First Step", description: "Add your first expense", icon: "🎯" },
                { id: "week-streak", name: "Week Warrior", description: "7 day tracking streak", icon: "🔥" },
                { id: "month-streak", name: "Monthly Master", description: "30 day tracking streak", icon: "💪" },
                { id: "budget-hero", name: "Budget Hero", description: "Stay under budget for a month", icon: "🦸" },
                { id: "smart-saver", name: "Smart Saver", description: "Build a 3-month emergency fund", icon: "💰" },
                { id: "financial-fortress", name: "Financial Fortress", description: "Build a 6-month emergency fund", icon: "🏰" },
              ].map((badge) => {
                const earned = gamification.badges.find(b => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg text-center space-y-2 ${
                      earned ? "bg-gradient-primary" : "bg-muted opacity-50"
                    }`}
                  >
                    <div className="text-4xl">{badge.icon}</div>
                    <div>
                      <p className={`font-bold ${earned ? "text-primary-foreground" : "text-foreground"}`}>
                        {badge.name}
                      </p>
                      <p className={`text-xs ${earned ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Rewards;
