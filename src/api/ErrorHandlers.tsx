import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { ErrorStatusOverlay } from "../components/Loadingoverlay";

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onSuccess: (data: any) => {
            console.log("error: 1 6", data)
        },
        onError: (error: any) => {
            console.log("error: 1 4", error)
            if (error.response?.status === 500) {
                // Show overlay
                <ErrorStatusOverlay isError message="fgf" status={500} />
            }
        },
    }),

    mutationCache: new MutationCache({
        onError: (error: any) => {
            console.log("error: 1 5", error)
            if (error.response?.status === 500) {
                // Show overlay
                <ErrorStatusOverlay isError message="fgf" status={500} />
            }
        },
    }),
});