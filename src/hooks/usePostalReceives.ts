
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { frontOffice } from "../api/endpoints";

export const POSTAL_RECEIVES_KEY = ["postal-receives"];

// Postal receive interface
export interface PostalReceive {
    id: number | string;
    from_title: string;
    reference_no: string;
    address: string;
    note: string;
    to_title: string;
    date: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

// Create payload
export interface CreatePostalReceivePayload {
    from_title: string;
    reference_no: string;
    address: string;
    note: string;
    to_title: string;
    date: string;
}

// Update payload
export interface UpdatePostalReceivePayload
    extends CreatePostalReceivePayload {
    id: number | string;
}

// Filters
export interface PostalReceiveFilter {
    page?: number;
    per_page?: number;
    search?: string;
}

// Fetch all postal receives
export const useFetchAllPostalReceives = (
    filters?: PostalReceiveFilter
) => {
    return useQuery<any>({
        queryKey: [...POSTAL_RECEIVES_KEY, filters],
        queryFn: async () => {
            const res = await axiosInstance.get(frontOffice.postal_receives, {
                params: {
                    page: filters?.page || undefined,
                    per_page: filters?.per_page || undefined,
                    search: filters?.search || undefined,
                },
            });

            return res.data;
        },
        placeholderData: (prev: any) => prev,
    });
};

// Add postal receive
export const useAddPostalReceive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreatePostalReceivePayload) => {
            const res = await axiosInstance.post(
                frontOffice.postal_receives,
                payload
            );

            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: POSTAL_RECEIVES_KEY,
            });
        },
    });
};

// Fetch postal receive details by ID
export const useFetchPostalReceiveById = (
    id?: number | string
) => {
    return useQuery<any>({
        queryKey: [...POSTAL_RECEIVES_KEY, "detail", id],
        queryFn: async () => {
            const res = await axiosInstance.get(
                `${frontOffice.postal_receives}/${id}`
            );

            return res.data;
        },
        enabled: !!id,
    });
};

// Update postal receive
export const useUpdatePostalReceive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdatePostalReceivePayload) => {
            const { id, ...data } = payload;
            const url = `${frontOffice.postal_receives}/${id}`;

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
                queryKey: POSTAL_RECEIVES_KEY,
            });

            queryClient.invalidateQueries({
                queryKey: [...POSTAL_RECEIVES_KEY, "detail", variables.id],
            });
        },
    });
};

// Delete postal receive
export const useRemovePostalReceive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number | string) => {
            const res = await axiosInstance.delete(
                `${frontOffice.postal_receives}/${id}`
            );

            return res.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: POSTAL_RECEIVES_KEY,
            });

            queryClient.removeQueries({
                queryKey: [...POSTAL_RECEIVES_KEY, "detail", id],
            });
        },
    });
};
