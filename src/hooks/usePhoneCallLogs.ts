
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "../api/axiosInstance"
import { frontOffice } from "../api/endpoints"


// Query key
export const PHONE_CALL_LOGS_KEY = ["phone-call-logs"]

// Types
export interface PhoneCallLog {
    id: number
    name: string
    phone: string
    date: string
    description: string
    next_follow_up_date: string
    call_duration: string
    note: string
    call_type: "Incoming" | "Outgoing" | string
}

export interface CreatePhoneCallLogPayload {
    name: string
    phone: string
    date: string
    description: string
    next_follow_up_date: string
    call_duration: string
    note: string
    call_type: string
}

export interface UpdatePhoneCallLogPayload
    extends Partial<CreatePhoneCallLogPayload> {
    id: number | string
}

export interface PhoneCallLogFilter {
    page?: number
    per_page?: number
    search?: string
}

// Fetch all phone call logs
export const useFetchAllPhoneCallLogs = (
    filters?: PhoneCallLogFilter
) => {
    return useQuery({
        queryKey: [...PHONE_CALL_LOGS_KEY, filters],
        queryFn: async () => {
            const response = await axiosInstance.get(
                frontOffice.phone_call_logs,
                {
                    params: {
                        page: filters?.page ?? 1,
                        per_page: filters?.per_page ?? 10,
                        search: filters?.search || undefined,
                    },
                }
            )

            return response.data
        },
        placeholderData: (previousData) => previousData,
    })
}

// Add phone call log
export const useAddPhoneCallLog = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: CreatePhoneCallLogPayload) => {
            const response = await axiosInstance.post(
                frontOffice.phone_call_logs,
                payload
            )

            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: PHONE_CALL_LOGS_KEY,
            })
        },
    })
}

// Fetch phone call log by ID
export const useFetchPhoneCallLogById = (
    id: number | string | undefined
) => {
    return useQuery({
        queryKey: [...PHONE_CALL_LOGS_KEY, "detail", id],
        queryFn: async () => {
            const response = await axiosInstance.get(
                `${frontOffice.phone_call_logs}/${id}`
            )

            return response.data
        },
        enabled: !!id,
    })
}

// Update phone call log
export const useUpdatePhoneCallLog = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            id,
            ...payload
        }: UpdatePhoneCallLogPayload) => {
            try {
                const response = await axiosInstance.put(
                    `${frontOffice.phone_call_logs}/${id}`,
                    payload
                )

                return response.data
            } catch (error: any) {
                // Fallback only when PUT is not supported
                if (error?.response?.status === 405) {
                    const response = await axiosInstance.post(
                        `${frontOffice.phone_call_logs}/${id}`,
                        payload
                    )

                    return response.data
                }

                throw error
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: PHONE_CALL_LOGS_KEY,
            })

            queryClient.invalidateQueries({
                queryKey: [
                    ...PHONE_CALL_LOGS_KEY,
                    "detail",
                    variables.id,
                ],
            })
        },
    })
}

// Delete phone call log
export const useRemovePhoneCallLog = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number | string) => {
            const response = await axiosInstance.delete(
                `${frontOffice.phone_call_logs}/${id}`
            )

            return response.data
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: PHONE_CALL_LOGS_KEY,
            })

            queryClient.removeQueries({
                queryKey: [
                    ...PHONE_CALL_LOGS_KEY,
                    "detail",
                    id,
                ],
            })
        },
    })
}
