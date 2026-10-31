import { useIsMutating } from "@tanstack/react-query";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export const useServiceWorkerUpdate = () => {
    const {
        needRefresh: [updateAvailable, setUpdateAvailable],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(_url, registration) {
            if (!registration) return;
            setInterval(() => {
                if (navigator.onLine) registration.update();
            }, UPDATE_CHECK_INTERVAL_MS);
        },
        onRegisterError(error) {
            console.error("Service worker registration failed:", error);
        },
    });

    // Reloading mid-save could lose the request, so Update Now waits for mutations to finish.
    const isSaving = useIsMutating() > 0;

    return {
        updateAvailable,
        isSaving,
        applyUpdate: () => updateServiceWorker(true),
        dismiss: () => setUpdateAvailable(false),
    };
};
