import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { frontOffice } from "../api/endpoints";

export const POSTAL_DISPATCHES_KEY = ["postal-dispatches"];

// Postal dispatch interface
export interface PostalDispatch {
    id: number | string;
    to_title: string;
    reference_no: string;
    address: string;
    note: string;
    from_title: string;
    date: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

// Create payload
export interface CreatePostalDispatchPayload {
    to_title: string;
    reference_no: string;
    address: string;
    note: string;
    from_title: string;
    date: string;
}

// Update payload
export interface UpdatePostalDispatchPayload
    extends CreatePostalDispatchPayload {
    id: number | string;
}

// Filters
export interface PostalDispatchFilter {
    page?: number;
    per_page?: number;
    search?: string;
}

// Fetch all postal dispatches
export const useFetchAllPostalDispatches = (
    filters?: PostalDispatchFilter
) => {
    return useQuery<any>({
        queryKey: [...POSTAL_DISPATCHES_KEY, filters],
        queryFn: async () => {
            const res = await axiosInstance.get(
                frontOffice.postal_dispatch,
                {
                    params: {
                        page: filters?.page || undefined,
                        per_page: filters?.per_page || undefined,
                        search: filters?.search || undefined,
                    },
                }
            );

            return res.data;
        },
        placeholderData: (prev: any) => prev,
    });
};

// Add postal dispatch
export const useAddPostalDispatch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreatePostalDispatchPayload) => {
            const res = await axiosInstance.post(
                frontOffice.postal_dispatch,
                payload
            );

            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: POSTAL_DISPATCHES_KEY,
            });
        },
    });
};

// Fetch postal dispatch details by ID
export const useFetchPostalDispatchById = (
    id?: number | string
) => {
    return useQuery<any>({
        queryKey: [...POSTAL_DISPATCHES_KEY, "detail", id],
        queryFn: async () => {
            const res = await axiosInstance.get(
                `${frontOffice.postal_dispatch}/${id}`
            );

            return res.data;
        },
        enabled: !!id,
    });
};

// Update postal dispatch
export const useUpdatePostalDispatch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: UpdatePostalDispatchPayload) => {
            const { id, ...data } = payload;
            const url = `${frontOffice.postal_dispatch}/${id}`;

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
                queryKey: POSTAL_DISPATCHES_KEY,
            });

            queryClient.invalidateQueries({
                queryKey: [
                    ...POSTAL_DISPATCHES_KEY,
                    "detail",
                    variables.id,
                ],
            });
        },
    });
};

// Delete postal dispatch
export const useRemovePostalDispatch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number | string) => {
            const res = await axiosInstance.delete(
                `${frontOffice.postal_dispatch}/${id}`
            );

            return res.data;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: POSTAL_DISPATCHES_KEY,
            });

            queryClient.removeQueries({
                queryKey: [
                    ...POSTAL_DISPATCHES_KEY,
                    "detail",
                    id,
                ],
            });
        },
    });
};
