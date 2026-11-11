// src/hooks/useDashboard.ts

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { dashboard } from "../api/endpoints";

export const DASHBOARD_KEY = ["dashboard"];

export interface DashboardSummary {
  students: number;
  teachers: number;
  parents: number;
  staffs: number;
}

export interface MonthlyStats {
  total_income: number;
  total_expenses: number;
  total_profit: number;
  total_revenue: number;
  wallet_balance: number;
}

export interface YearlyStat {
  month: string;
  income: number;
  expenses: number;
}

export interface Notice {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export interface CardStats {
  students: {
    messages: {
      category: string;
      count: number;
      text: string;
      type: string;
    }[];
    new_this_month: number;
    notification_message: string;
    pending_fee_payments: number;
    total_count: number;
  };
  teachers: {
    messages: {
      category: string;
      count: number;
      text: string;
      type: string;
    }[];
    new_this_month: number;
    notification_message: string;
    pending_fee_payments: number;
    total_count: number;
  };
  parents: {
    messages: {
      category: string;
      count: number;
      text: string;
      type: string;
    }[];
    new_this_month: number;
    notification_message: string;
    pending_fee_payments: number;
    total_count: number;
  };
  staffs: {
    messages: {
      category: string;
      count: number;
      text: string;
      type: string;
    }[];
    new_this_month: number;
    notification_message: string;
    pending_fee_payments: number;
    total_count: number;
  };
}

export interface DashboardData {
  summary: DashboardSummary;
  monthly_stats: MonthlyStats;
  yearly_stats: YearlyStat[];
  notices: Notice[];
  todos: [];
  events: [];
  roles: string[];
  current_month_year: string;
  current_year: number;
  card_stats: CardStats;
  school_info: {
    category_of_institution?: string;
    school_name?: string;
    suic_code?: string;
    zone?: string;
  };
}

interface DashboardResponse {
  data: DashboardData;
}

export const useDashboard = () => {
  return useQuery<DashboardData>({
    queryKey: DASHBOARD_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<DashboardResponse>(
        `${dashboard.dashboard}`
      );
      return res.data.data;
    },
    refetchOnMount: true,
  });
};
