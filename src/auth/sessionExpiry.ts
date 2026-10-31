import type { AxiosError } from "axios";

export const SESSION_EXPIRED_EVENT = "auth:session-expired";

// A 401 from these means wrong credentials or a wrong code, not an expired session.
const AUTH_PATHS = ["/login", "/logout", "/forgot-password", "/reset-password", "/password/", "/2fa/"];

export const notifyIfSessionExpired = (error: AxiosError) => {
    if (error.response?.status !== 401) return;

    const url = error.config?.url ?? "";
    if (AUTH_PATHS.some((path) => url.includes(path))) return;

    const stored = localStorage.getItem("auth");
    const token = stored ? JSON.parse(stored)?.token : null;

    // A late response from an older session must not sign out the current one.
    if (token && error.config?.headers?.Authorization === `Bearer ${token}`) {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
};
