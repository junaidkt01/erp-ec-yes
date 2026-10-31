import { useCallback, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_install_dismissed_at";
const DISMISS_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOSSafari = () => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
};

const wasDismissedRecently = () => {
    try {
        return Date.now() - Number(localStorage.getItem(DISMISSED_KEY) || 0) < DISMISS_PERIOD_MS;
    } catch {
        return false;
    }
};

interface InstallState {
    promptEvent: BeforeInstallPromptEvent | null;
    isInstalled: boolean;
    isDismissed: boolean;
    justInstalled: boolean;
}

let state: InstallState = {
    promptEvent: null,
    isInstalled: isStandalone(),
    isDismissed: wasDismissedRecently(),
    justInstalled: false,
};

const listeners = new Set<() => void>();
const setState = (next: Partial<InstallState>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
};

// Registered at import time: the browser can fire this before React has mounted.
window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    setState({ promptEvent: event as BeforeInstallPromptEvent });
});

window.addEventListener("appinstalled", () => {
    setState({ promptEvent: null, isInstalled: true, justInstalled: true });
});

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

export const usePWAInstall = () => {
    const { promptEvent, isInstalled, isDismissed, justInstalled } = useSyncExternalStore(subscribe, () => state);
    const showIOSInstructions = !isInstalled && isIOSSafari();

    const install = useCallback(async () => {
        if (!promptEvent) return;
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        // A prompt event can only be used once.
        setState({ promptEvent: null, isDismissed: outcome === "dismissed" });
    }, [promptEvent]);

    const dismiss = useCallback(() => {
        try {
            localStorage.setItem(DISMISSED_KEY, String(Date.now()));
        } catch {
            // Storage can be blocked; the prompt then stays hidden for this session only.
        }
        setState({ isDismissed: true });
    }, []);

    return {
        canPrompt: Boolean(promptEvent) && !isInstalled,
        showIOSInstructions,
        isInstalled,
        isDismissed,
        justInstalled,
        install,
        dismiss,
    };
};
