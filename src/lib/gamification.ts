import { GamificationData, Badge } from "@/types/gamification";

const STORAGE_KEY = "trackwise_gamification";

const getUserKey = (userId?: string): string => {
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
};

const defaultGamificationData = (): GamificationData => ({
  badges: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
  },
  emergencyFund: {
    amount: 0,
    monthlyExpenses: 0,
    targetMonths: 6,
  },
});

export const getGamificationData = (userId?: string): GamificationData => {
  const data = localStorage.getItem(getUserKey(userId));
  return data ? JSON.parse(data) : defaultGamificationData();
};

export const saveGamificationData = (data: GamificationData, userId?: string) => {
  localStorage.setItem(getUserKey(userId), JSON.stringify(data));
};

export const updateStreak = (userId?: string) => {
  const data = getGamificationData(userId);
  const today = new Date().toISOString().split('T')[0];
  const lastDate = data.streak.lastActivityDate;

  if (lastDate === today) return data;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDate === yesterdayStr) {
    data.streak.currentStreak += 1;
  } else {
    data.streak.currentStreak = 1;
  }

  data.streak.longestStreak = Math.max(data.streak.longestStreak, data.streak.currentStreak);
  data.streak.lastActivityDate = today;

  saveGamificationData(data, userId);
  checkAndAwardBadges(data, userId);
  return data;
};

export const updateEmergencyFund = (amount: number, monthlyExpenses: number, userId?: string) => {
  const data = getGamificationData(userId);
  data.emergencyFund.amount = amount;
  data.emergencyFund.monthlyExpenses = monthlyExpenses;
  saveGamificationData(data, userId);
  checkAndAwardBadges(data, userId);
};

const checkAndAwardBadges = (data: GamificationData, userId?: string) => {
  const badges: Badge[] = [
    {
      id: "first-expense",
      name: "First Step",
      description: "Added your first expense",
      icon: "🎯",
    },
    {
      id: "week-streak",
      name: "Week Warrior",
      description: "7 day tracking streak",
      icon: "🔥",
    },
    {
      id: "month-streak",
      name: "Monthly Master",
      description: "30 day tracking streak",
      icon: "💪",
    },
    {
      id: "budget-hero",
      name: "Budget Hero",
      description: "Stayed under budget for a month",
      icon: "🦸",
    },
    {
      id: "smart-saver",
      name: "Smart Saver",
      description: "Built a 3-month emergency fund",
      icon: "💰",
    },
    {
      id: "financial-fortress",
      name: "Financial Fortress",
      description: "Built a 6-month emergency fund",
      icon: "🏰",
    },
  ];

  const earnedBadgeIds = new Set(data.badges.map(b => b.id));

  badges.forEach(badge => {
    if (earnedBadgeIds.has(badge.id)) return;

    let shouldAward = false;

    switch (badge.id) {
      case "week-streak":
        shouldAward = data.streak.currentStreak >= 7;
        break;
      case "month-streak":
        shouldAward = data.streak.currentStreak >= 30;
        break;
      case "smart-saver":
        shouldAward = data.emergencyFund.monthlyExpenses > 0 && 
                     (data.emergencyFund.amount / data.emergencyFund.monthlyExpenses) >= 3;
        break;
      case "financial-fortress":
        shouldAward = data.emergencyFund.monthlyExpenses > 0 && 
                     (data.emergencyFund.amount / data.emergencyFund.monthlyExpenses) >= 6;
        break;
    }

    if (shouldAward) {
      data.badges.push({ ...badge, earnedAt: new Date().toISOString() });
      saveGamificationData(data, userId);
    }
  });
};
