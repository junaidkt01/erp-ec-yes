//useFeeGroup.ts//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { generalSettings } from "../api/endpoints";
import { useAuth, getStoredAuth } from "../auth/useAuth";

export const GENERAL_SETTINGS_KEY = ["general-settings"];

export interface GeneralSettings {
  data: {
    id: number;
    logo: string;
    favicon: string;
    school_name: string;
    site_title: string;
    address: string;
    phone: string;
    email: string;
    fees_income_head: string;
    school_code: string;
    academic_year_id: number | string | null | any;
    language: string;
    date_format: string;
    week_start_day: string;
    time_zone: string;
    currency: string;
    currency_symbol: string;
    max_upload_size: string;
    multiple_roll_number: string;
    promotion_without_exam: string;
    subject_attendance_layout: string;
    new_fees_module: string;
    result_type: string;
    student_admission: string;
    due_fees_login_restriction: string;
    in_news_auto_approval_comment: string;
    in_news_can_comment: string;
    blog_search: string;
    recent_blog: string;
    carry_forward_fees_due_days: string;
    queue_connection: string;
    copyright_text: string;
    created_at: string;
    updated_at: string;

    category_of_institution:string;
    suic_code:string;
    zone:string;
    state:string;
  };
}

// interface FeeGroupResponse {
//   data: FeeGroup[];
// }

// Fetch All FeeGroups
// export const useFetchGeneralSettings = () => {
//   return useQuery<GeneralSettings>({
//     queryKey: [...GENERAL_SETTINGS_KEY],
//     queryFn: async () => {
//       const res = await axiosInstance.get<GeneralSettings>(
//         `${generalSettings.generalSettings}`,
//       );

//       return res.data;
//     },
//   });
// };

export const useFetchGeneralSettings = (options?: { enabled?: boolean }) => {
  const { data: authData } = useAuth();
  const isLoggedIn = Boolean(authData || getStoredAuth());

  return useQuery<GeneralSettings>({
    queryKey: GENERAL_SETTINGS_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<GeneralSettings>(
        `${generalSettings.generalSettings}`,
      );

      return res.data;
    },

    enabled: options?.enabled !== undefined ? options.enabled && isLoggedIn : isLoggedIn,

    // Consider data fresh for 1 hour
    staleTime: 1000 * 60 * 60,

    // Keep it in cache for 24 hours after unused
    gcTime: 1000 * 60 * 60 * 24,

    // Don't refetch when window gains focus
    refetchOnWindowFocus: false,

    // Don't refetch when component mounts if data is fresh
    refetchOnMount: false,

    // Retry if request fails
    retry: 2,
  });
};

//update FeeGroup api

export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GeneralSettings) => {
      const { ...data } = payload;

      const res = await axiosInstance.put(`${generalSettings.generalSettings}`,
        data,
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...GENERAL_SETTINGS_KEY],
      });
    },
  });
};


// hooks/useUploadLogo.ts

////////// upload logo
export const uploadGeneralSettingsLogo = async (logo: File) => {
  const formData = new FormData();

  formData.append("logo", logo);

  const { data } = await axiosInstance.post(
    `${generalSettings.generalSettings}${generalSettings.logo}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

export const useUploadGeneralSettingsLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logo: File) => uploadGeneralSettingsLogo(logo),

    onSuccess: () => {
      // Refetch general settings if you have a query for it
      queryClient.invalidateQueries({
        queryKey: [...GENERAL_SETTINGS_KEY],
      });
    },
  });
};


////////// upload favicon
export const uploadGeneralSettingsFavicon = async (favicon: File) => {
  const formData = new FormData();

  formData.append("favicon", favicon);

  const { data } = await axiosInstance.post(
    `${generalSettings.generalSettings}${generalSettings.favicon}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};
export const useUploadGeneralSettingsFavicon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favicon: File) => uploadGeneralSettingsFavicon(favicon),

    onSuccess: () => {
      // Refetch general settings if you have a query for it
      queryClient.invalidateQueries({
       queryKey: [...GENERAL_SETTINGS_KEY],
      });
    },
  });
};