//useDashboard.ts//

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { dashboard } from "../api/endpoints";

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
  school_info: {
    category_of_institution?: string
    school_name?: string
    suic_code?: string
    zone?: string
  }
}

interface DashboardResponse {
  data: DashboardData;
}

export const useDashboard = () => {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await axiosInstance.get<DashboardResponse>(
        `${dashboard.dashboard}`,
      );
      return res.data.data;
    },
  });
};
