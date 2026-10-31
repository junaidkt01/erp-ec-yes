import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, RefreshCw, Share, WifiOff } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useServiceWorkerUpdate } from "../../hooks/useServiceWorkerUpdate";
import { useSessionExpiry } from "../../hooks/useSessionExpiry";
import { useTranslation } from "../../i18n/LanguageContext";
import "./PWA.scss";

const AUTH_PATHS = ["/", "/forgot-password"];

const OfflineIndicator = () => {
    const { t } = useTranslation();
    const { isOnline } = useNetworkStatus();
    const queryClient = useQueryClient();
    const queryCache = queryClient.getQueryCache();

    // The oldest data on screen, so the age shown is never better than the truth.
    const dataTime = useSyncExternalStore(queryCache.subscribe, () => {
        const times = queryCache
            .getAll()
            .filter((query) => query.isActive() && query.queryKey[0] !== "auth" && query.state.dataUpdatedAt > 0)
            .map((query) => query.state.dataUpdatedAt);
        return times.length ? Math.min(...times) : 0;
    });

    const wasOnline = useRef(isOnline);
    useEffect(() => {
        if (wasOnline.current === isOnline) return;
        wasOnline.current = isOnline;
        if (!isOnline) return;

        toast.success(t("pwa.restored", "Internet connection restored"));
        // Global refetchOnReconnect stays off; only requests that failed are retried.
        queryClient.refetchQueries({ type: "active", predicate: (query) => query.state.status === "error" });
    }, [isOnline, queryClient, t]);

    if (isOnline) return null;

    const time = new Date(dataTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    return (
        <div className="pwa_offline_indicator" role="status">
            <WifiOff size={15} aria-hidden="true" />
            <span>
                {dataTime
                    ? `${t("pwa.offlineData", "You're offline. Data on this page is from")} ${time}`
                    : t("pwa.offline", "You're offline")}
            </span>
        </div>
    );
};

const UpdatePrompt = () => {
    const { t } = useTranslation();
    const { updateAvailable, isSaving, applyUpdate, dismiss } = useServiceWorkerUpdate();

    if (!updateAvailable) return null;

    return (
        <div className="pwa_card" role="status">
            <RefreshCw size={20} aria-hidden="true" />
            <div className="pwa_card_text">
                <p className="pwa_card_title">{t("pwa.updateTitle", "A new version is available")}</p>
                <p>{t("pwa.updateBody", "Save your work first. The app will reload to update.")}</p>
            </div>
            <div className="pwa_card_actions">
                <SecondaryButton title={t("pwa.later", "Later")} onClick={dismiss} />
                <PrimaryButton
                    title={isSaving ? t("pwa.saving", "Saving...") : t("pwa.updateNow", "Update Now")}
                    disabled={isSaving}
                    onClick={applyUpdate}
                />
            </div>
        </div>
    );
};

const InstallPrompt = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const { isOnline } = useNetworkStatus();
    const { canPrompt, showIOSInstructions, isInstalled, isDismissed, justInstalled, install, dismiss } = usePWAInstall();

    useEffect(() => {
        if (justInstalled) toast.success(t("pwa.installed", "YES ERP was installed"));
    }, [justInstalled, t]);

    const isAuthPage = AUTH_PATHS.includes(pathname) || pathname.startsWith("/reset-password");
    if (isInstalled || isDismissed || isAuthPage || !isOnline || !(canPrompt || showIOSInstructions)) return null;

    return (
        <div className="pwa_card" role="status">
            <Download size={20} aria-hidden="true" />
            <div className="pwa_card_text">
                <p className="pwa_card_title">{t("pwa.installTitle", "Install YES ERP")}</p>
                {canPrompt ? (
                    <p>{t("pwa.installBody", "Open the ERP from your home screen or desktop.")}</p>
                ) : (
                    <p>
                        {t("pwa.iosStep1", "Tap")} <Share size={14} aria-label="Share" className="pwa_inline_icon" />{" "}
                        {t("pwa.iosStep2", "then Add to Home Screen.")}
                    </p>
                )}
            </div>
            <div className="pwa_card_actions">
                <SecondaryButton title={t("pwa.notNow", "Not now")} onClick={dismiss} />
                {canPrompt && <PrimaryButton title={t("pwa.install", "Install")} onClick={install} />}
            </div>
        </div>
    );
};

const PWAStatus = () => {
    const { t } = useTranslation();
    useSessionExpiry(t("pwa.sessionExpired", "Your session has expired. Please sign in again."));

    return (
        <>
            <OfflineIndicator />
            <div className="pwa_stack">
                <UpdatePrompt />
                <InstallPrompt />
            </div>
        </>
    );
};

export default PWAStatus;
