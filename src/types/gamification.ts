export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
}

export interface EmergencyFund {
  amount: number;
  monthlyExpenses: number;
  targetMonths: number;
}

export interface GamificationData {
  badges: Badge[];
  streak: Streak;
  emergencyFund: EmergencyFund;
}
