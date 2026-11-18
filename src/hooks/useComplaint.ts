
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { frontOffice } from "../api/endpoints";

// Query keys
export const COMPLAINTS_KEY = ["complaints"];

// Complaint interface
export interface Complaint {
    id: number | string;
    name: string;
    phone: string;
    email?: string | null;
    message: string;
    complaint_type: string;
    source: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

// Create complaint payload
export interface CreateComplaintPayload {
    name: string;
    phone: string;
    email?: string;
    message: string;
    complaint_type: string;
    source: string;
    status?: string;
}

// Update complaint payload
export interface UpdateComplaintPayload extends CreateComplaintPayload {
    id: number | string;
}

// Complaint filters
export interface ComplaintFilter {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    complaint_type?: string;
    source?: string;
}

// Fetch all complaints
export const useFetchAllComplaints = (filters?: ComplaintFilter) => {
    return useQuery<any>({
        queryKey: [...COMPLAINTS_KEY, filters],
        queryFn: async () => {
            const res = await axiosInstance.get(frontOffice.complaints, {
                params: {
                    page: filters?.page || undefined,
                    per_page: filters?.per_page || undefined,
                    search: filters?.search || undefined,
                    status: filters?.status || undefined,
                    complaint_type: filters?.complaint_type || undefined,
                    source: filters?.source || undefined,
                },
            });

            return res.data;
        },
        placeholderData: (prev: any) => prev,
    });
};

// Add new complaint
export const useAddComplaint = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateComplaintPayload) => {
            const res = await axiosInstance.post(frontOffice.complaints, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEY });
        },
    });
};

// Fetch complaint details by ID
export const useFetchComplaintById = (id?: number | string) => {
    return useQuery<any>({
        queryKey: [...COMPLAINTS_KEY, "detail", id],
        queryFn: async () => {
            const res = await axiosInstance.get(
                `${frontOffice.complaints}/${id}`
            );

            return res.data;
        },
        enabled: !!id,
    });
};

// Update complaint
export const useUpdateComplaint = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdateComplaintPayload) => {
            const { id, ...data } = payload;
            const url = `${frontOffice.complaints}/${id}`;

            try {
                const res = await axiosInstance.put(url, data);
                return res.data;
            } catch (err: any) {
                if (err?.response?.status === 405) {
                    const res = await axiosInstance.post(url, data);
                    return res.data;
                }

                throw err;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: COMPLAINTS_KEY,
            });

            queryClient.invalidateQueries({
                queryKey: [...COMPLAINTS_KEY, "detail", variables.id],
            });
        },
    });
};

// Delete complaint
export const useRemoveComplaint = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number | string) => {
            const res = await axiosInstance.delete(
                `${frontOffice.complaints}/${id}`
            );

            return res.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: COMPLAINTS_KEY,
            });

            queryClient.removeQueries({
                queryKey: [...COMPLAINTS_KEY, "detail", id],
            });
        },
    });
};
