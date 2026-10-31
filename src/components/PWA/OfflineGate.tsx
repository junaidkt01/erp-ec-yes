import type { ReactNode } from "react";
import { WifiOff } from "lucide-react";
import { PrimaryButton } from "../Buttons/Buttons";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useTranslation } from "../../i18n/LanguageContext";
import "./PWA.scss";

export const OfflinePage = () => {
    const { t } = useTranslation();

    return (
        <div className="pwa_offline_page">
            <div className="pwa_offline_content">
                <WifiOff size={36} aria-hidden="true" />
                <h1>{t("pwa.offlinePageTitle", "You're offline")}</h1>
                <p>{t("pwa.offlinePageBody", "ERP records are not stored on this device. Connect to the internet to continue.")}</p>
                <PrimaryButton title={t("pwa.tryAgain", "Try Again")} onClick={() => window.location.reload()} />
            </div>
        </div>
    );
};

// An app opened offline has no data at all, so pages would only show failed requests.
// Going offline during a session keeps the page, because its loaded data is still useful.
export const OfflineGate = ({ children }: { children: ReactNode }) => {
    const { startedOffline } = useNetworkStatus();
    return startedOffline ? <OfflinePage /> : children;
};
