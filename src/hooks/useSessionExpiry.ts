import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SESSION_EXPIRED_EVENT } from "../auth/sessionExpiry";

export const useSessionExpiry = (message: string) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleExpired = () => {
            // Several requests can fail together; only the first one signs out.
            if (!localStorage.getItem("auth")) return;

            localStorage.removeItem("auth");
            queryClient.clear();
            toast.error(message);
            navigate("/", { replace: true });
        };

        window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    }, [message, navigate, queryClient]);
};
