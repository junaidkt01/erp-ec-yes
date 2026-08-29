import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
    Lock,
    ShieldAlert,
    FileQuestion,
    AlertCircle,
    Hourglass,
    ServerCrash,
    WifiOff,
    AlertOctagon,
    Clock,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";
import { useOverlayStore } from "../stores/loadingOverlay";
import "./components.scss"

// const RingSpinner = () => (
//     <div className="w-10 h-10 rounded-full border border-white/10 border-t-white/80 animate-spin" />
// );

const DotSpinner = () => (
    <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/80"
                    style={{ animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
            ))}
        </div>
        <span className="text-[11px] tracking-[0.12em] text-white/35 font-mono uppercase">
            loading
        </span>
    </div>
);

// const ArcSpinner = () => (
//     <svg
//         width="44"
//         height="44"
//         viewBox="0 0 44 44"
//         className="animate-spin"
//         style={{ animationDuration: "2.4s", animationTimingFunction: "linear" }}
//     >
//         <circle cx="22" cy="22" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
//         <circle
//             cx="22"
//             cy="22"
//             r="14"
//             fill="none"
//             stroke="rgba(255,255,255,0.85)"
//             strokeWidth="1.5"
//             strokeLinecap="round"
//             strokeDasharray="88"
//             strokeDashoffset="22"
//             style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
//         />
//     </svg>
// );

interface StatusConfig {
    title: string;
    description: string;
    actionText: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

function getErrorDetails(status?: number | string | null): StatusConfig {
    const numericStatus = typeof status === "number" ? status : status ? parseInt(String(status), 10) : null;

    switch (numericStatus) {
        case 400:
            return {
                title: "Bad Request",
                description: "The request could not be processed by the server due to invalid parameters.",
                actionText: "Refresh & Sign In",
                icon: AlertCircle,
            };
        case 401:
            return {
                title: "Authentication Required",
                description: "Your session may have expired or you are not authenticated. Please sign in again to continue.",
                actionText: "Refresh & Sign In",
                icon: Lock,
            };
        case 403:
            return {
                title: "Access Denied",
                description: "You do not have permission to view or access this resource. Please sign in with an authorized account.",
                actionText: "Refresh & Sign In",
                icon: ShieldAlert,
            };
        case 404:
            return {
                title: "Page Not Found",
                description: "The requested page or resource could not be found or has been moved.",
                actionText: "Return & Sign In",
                icon: FileQuestion,
            };
        case 408:
            return {
                title: "Request Timeout",
                description: "The server took too long to respond. Please check your network connection and try again.",
                actionText: "Refresh & Sign In",
                icon: Clock,
            };
        case 422:
            return {
                title: "Invalid Request",
                description: "The request was formatted properly but could not be processed due to validation errors.",
                actionText: "Refresh & Sign In",
                icon: AlertCircle,
            };
        case 429:
            return {
                title: "Too Many Requests",
                description: "You have sent too many requests in a short period. Please wait a moment before trying again.",
                actionText: "Refresh & Sign In",
                icon: Hourglass,
            };
        case 500:
            return {
                title: "Something Went Wrong",
                description: "An unexpected server error occurred. Our technical team has been notified. Please try refreshing.",
                actionText: "Refresh & Sign In",
                icon: ServerCrash,
            };
        case 502:
            return {
                title: "Bad Gateway",
                description: "The server received an invalid response from the upstream gateway. Please try again shortly.",
                actionText: "Refresh & Sign In",
                icon: WifiOff,
            };
        case 503:
            return {
                title: "Service Unavailable",
                description: "The service is temporarily undergoing maintenance or is overloaded. Please try again in a few moments.",
                actionText: "Refresh & Sign In",
                icon: AlertOctagon,
            };
        case 504:
            return {
                title: "Gateway Timeout",
                description: "The upstream server did not respond in time. Please try refreshing your session.",
                actionText: "Refresh & Sign In",
                icon: Clock,
            };
        default:
            return {
                title: "Something Went Wrong",
                description: "An unexpected error occurred while processing your request. Please refresh or sign in again to continue.",
                actionText: "Refresh & Sign In",
                icon: AlertTriangle,
            };
    }
}

export interface ErrorStatusOverlayProps {
    isError?: boolean;
    status?: number | string | null;
    message?: string | null;
    title?: string | null;
    actionText?: string | null;
    onAction?: () => void | Promise<void>;
}

export function ErrorStatusOverlay({
    isError = true,
    status = null,
    message = "",
    title: customTitle,
    actionText: customActionText,
    onAction,
}: ErrorStatusOverlayProps) {
    const [visible, setVisible] = useState(isError);
    const [opacity, setOpacity] = useState(isError ? 1 : 0);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navigate = useNavigate();

    let queryClient: any = null;
    try {
        queryClient = useQueryClient();
    } catch {
        // graceful fallback if rendered outside TanStack Query context
    }

    useEffect(() => {
        if (isError) {
            setVisible(true);
            requestAnimationFrame(() => setOpacity(1));
        } else {
            setOpacity(0);
            const t = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(t);
        }
    }, [isError]);

    const numericStatus = useMemo(() => {
        if (typeof status === "number") return status;
        if (status && !isNaN(Number(status))) return Number(status);
        return null;
    }, [status]);

    const errorConfig = useMemo(() => {
        return getErrorDetails(numericStatus);
    }, [numericStatus]);

    const displayTitle = customTitle || errorConfig.title;
    const displayStatus = numericStatus ? String(numericStatus) : "ERROR";

    // Show message if it is non-empty and not a dummy/placeholder string
    const isHelpfulMessage = useMemo(() => {
        if (!message) return false;
        const trimmed = message.trim();
        if (!trimmed) return false;
        const lower = trimmed.toLowerCase();
        if (
            lower === "error" ||
            lower === "data.message" ||
            lower === "fgf" ||
            lower === "undefined" ||
            lower === "null" ||
            lower === "[object object]"
        ) {
            return false;
        }
        if (lower === displayTitle.toLowerCase() || lower === errorConfig.description.toLowerCase()) {
            return false;
        }
        return true;
    }, [message, displayTitle, errorConfig.description]);

    const handleAction = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            if (onAction) {
                await onAction();
            }

            // 1. Invalidate and remove authenticated session data
            localStorage.removeItem("auth");
            sessionStorage.removeItem("auth");

            // 2. Clear queryClient cache to prevent stale data retention
            if (queryClient) {
                try {
                    queryClient.clear();
                    queryClient.removeQueries();
                } catch (e) {
                    console.error("Query cache clear error:", e);
                }
            }

            // 3. Hide the global overlay store if open
            try {
                useOverlayStore.getState().hide();
            } catch (e) {
                console.error("Overlay store hide error:", e);
            }

            // 4. Smooth navigation to the existing login page route
            setTimeout(() => {
                try {
                    navigate("/", { replace: true });
                } catch {
                    window.location.href = "/";
                }
            }, 100);
        } catch (err) {
            console.error("Error during session reset:", err);
            window.location.href = "/";
        } finally {
            setTimeout(() => {
                setIsLoggingOut(false);
            }, 1000);
        }
    };

    if (!visible) return null;

    const IconComponent = errorConfig.icon;

    return (
        <div
            className={`error_status_overlay ${opacity === 1 ? "visible" : ""}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="error-dialog-title"
            aria-describedby="error-dialog-desc"
        >
            <div className={`error_modal_card ${opacity === 1 ? "animate_in" : ""}`}>
                {/* Top subtle brand accent bar */}
                <div className="error_accent_bar" />

                {/* Soft icon container */}
                <div className="error_icon_wrapper">
                    <div className="icon_glow" />
                    <div className="icon_box">
                        <IconComponent size={26} strokeWidth={2.2} />
                    </div>
                </div>

                {/* Prominent HTTP Status Pill */}
                <div className="error_status_pill">
                    <span className="status_dot" />
                    <span>HTTP {displayStatus}</span>
                </div>

                {/* Error Title */}
                <h2 id="error-dialog-title" className="error_title">
                    {displayTitle}
                </h2>

                {/* Short Description */}
                <p id="error-dialog-desc" className="error_description">
                    {errorConfig.description}
                </p>

                {/* Server detail note if provided */}
                {isHelpfulMessage && (
                    <div className="error_custom_message">
                        {message}
                    </div>
                )}

                {/* Primary Button matching the application design system */}
                <div className="error_action_wrapper">
                    <button
                        type="button"
                        onClick={handleAction}
                        disabled={isLoggingOut}
                        className="button primary_button error_primary_button"
                    >
                        <div className="ripple-layer" />
                        {isLoggingOut ? (
                            <span className="loader" />
                        ) : (
                            <span className="btn_content">
                                <RefreshCw size={15} />
                                <span>{customActionText || errorConfig.actionText}</span>
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default function LoadingOverlay({ isLoading = false }) {
    const [visible, setVisible] = useState(isLoading);
    const [opacity, setOpacity] = useState(isLoading ? 1 : 0);

    useEffect(() => {
        if (isLoading) {
            setVisible(true);
            requestAnimationFrame(() => setOpacity(1));
        } else {
            setOpacity(0);
            const t = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(t);
        }
    }, [isLoading]);

    if (!visible) return null;

    return (
        <>
            <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.25; }
          40%            { transform: scale(1);    opacity: 1;    }
        }
      `}</style>

            <div className="fixed inset-0 z-9999 flex items-center justify-center"
                style={{
                    background: "rgba(10, 10, 10, 0.32)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    opacity,
                    transition: "opacity 0.3s ease",
                    pointerEvents: isLoading ? "all" : "none",
                }}
                aria-live="polite"
                aria-label="Loading"
            >
                <DotSpinner />
            </div>
        </>
    );
}