import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string | undefined;
}

export interface TurnstileProps {
  siteKey?: string;
  onVerify?: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: any) => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  className?: string;
}

const SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  (
    {
      siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
      onVerify,
      onExpire,
      onError,
      theme = "auto",
      size = "normal",
      className = "",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
      getResponse: () => {
        if (widgetIdRef.current && window.turnstile) {
          return window.turnstile.getResponse(widgetIdRef.current);
        }
        return undefined;
      },
    }));

    useEffect(() => {
      let isMounted = true;

      const renderWidget = () => {
        if (!isMounted || !containerRef.current || !window.turnstile) return;

        // Clean up previous widget if any
        if (widgetIdRef.current !== null) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            size,
            callback: (token: string) => {
              if (onVerify) onVerify(token);
            },
            "expired-callback": () => {
              if (onExpire) onExpire();
            },
            "error-callback": (err: any) => {
              if (onError) onError(err);
            },
          });
          widgetIdRef.current = id;
        } catch (err) {
          console.error("Failed to render Cloudflare Turnstile:", err);
        }
      };

      // Check if script already exists or turnstile is already present
      if (window.turnstile) {
        renderWidget();
      } else {
        // Handle global callback
        window.onloadTurnstileCallback = () => {
          if (isMounted) renderWidget();
        };

        let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement("script");
          script.id = SCRIPT_ID;
          script.src = `${TURNSTILE_URL}&onload=onloadTurnstileCallback`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current !== null && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [siteKey, theme, size, onVerify, onExpire, onError]);

    return (
      <div
        ref={containerRef}
        className={`turnstile_container ${className}`}
        style={{ minHeight: size === "compact" ? "120px" : "65px" }}
      />
    );
  }
);

Turnstile.displayName = "Turnstile";
