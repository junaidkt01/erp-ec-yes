import { useCallback } from "react";

// Files and blob: preview URLs can't survive a reload, so they're skipped.
const replacer = (_: string, v: unknown) =>
    v instanceof File || (typeof v === "string" && v.startsWith("blob:")) ? undefined : v;

/** Save / load / clear a form draft in localStorage under `key`. */
export const useFormDraft = <T,>(key: string) => {
    const load = useCallback((): Partial<T> | null => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, [key]);

    const save = useCallback((data: T) => {
        try {
            localStorage.setItem(key, JSON.stringify(data, replacer));
            return true;
        } catch {
            return false;
        }
    }, [key]);

    const clear = useCallback(() => {
        try {
            localStorage.removeItem(key);
        } catch { /* ignore */ }
    }, [key]);

    return { load, save, clear };
};
