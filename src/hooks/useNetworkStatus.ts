import { useSyncExternalStore } from "react";

// Stays false only when the app was opened offline, so nothing has been fetched in this session.
let hasBeenOnline = navigator.onLine;
window.addEventListener("online", () => {
    hasBeenOnline = true;
});

const subscribe = (onChange: () => void) => {
    window.addEventListener("online", onChange);
    window.addEventListener("offline", onChange);
    return () => {
        window.removeEventListener("online", onChange);
        window.removeEventListener("offline", onChange);
    };
};

export const useNetworkStatus = () => {
    const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine);

    return {
        isOnline,
        startedOffline: !isOnline && !hasBeenOnline,
    };
};
