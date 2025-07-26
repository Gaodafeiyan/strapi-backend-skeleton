export interface QianbaoYue {
  id: number;
  usdtYue: string;
  aiYue: string;
  aiTokenBalances: string;
  user: number;
  createdAt: string;
  updatedAt: string;
}

export interface DinggouJihua {
  id: number;
  name: string;
  maxSlots: number;
  currentSlots: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  jingtaiBili: string;
  aiBili: string;
  zhouQiTian: number;
  kaiqi: boolean;
  lotteryChances: number;
  lotteryPrizeId?: number;
  jihuaCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DinggouDingdan {
  id: number;
  user: number;
  jihua: number;
  amount: string;
  principal: string;
  yieldRate: string;
  cycleDays: number;
  startAt: string;
  endAt: string;
  redeemedAt?: string;
  payoutAmount?: string;
  status: 'pending' | 'running' | 'finished' | 'cancelled' | 'redeemable';
  createdAt: string;
  updatedAt: string;
} 