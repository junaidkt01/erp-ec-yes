import { useEffect, useRef, useImperativeHandle, forwardRef, memo } from "react";

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

let isScriptLoading = false;
const scriptReadyCallbacks: Array<() => void> = [];

function loadTurnstileScript(onReady: () => void) {
  if (typeof window === "undefined") return;

  if (window.turnstile) {
    onReady();
    return;
  }

  scriptReadyCallbacks.push(onReady);

  if (isScriptLoading) return;

  const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        while (scriptReadyCallbacks.length > 0) {
          const cb = scriptReadyCallbacks.shift();
          cb?.();
        }
      }
    }, 50);
    return;
  }

  isScriptLoading = true;

  window.onloadTurnstileCallback = () => {
    isScriptLoading = false;
    while (scriptReadyCallbacks.length > 0) {
      const cb = scriptReadyCallbacks.shift();
      cb?.();
    }
  };

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = `${TURNSTILE_URL}&onload=onloadTurnstileCallback`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    isScriptLoading = false;
    console.error("Failed to load Cloudflare Turnstile script.");
  };
  document.head.appendChild(script);
}

export const Turnstile = memo(
  forwardRef<TurnstileRef, TurnstileProps>(
    (
      {
        siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY,
        onVerify,
        onExpire,
        onError,
        theme = "light",
        size = "normal",
        className = "",
      },
      ref
    ) => {
      const containerRef = useRef<HTMLDivElement | null>(null);
      const widgetIdRef = useRef<string | null>(null);

      // Keep latest callbacks in refs so changes don't trigger re-render
      const onVerifyRef = useRef(onVerify);
      const onExpireRef = useRef(onExpire);
      const onErrorRef = useRef(onError);

      useEffect(() => {
        onVerifyRef.current = onVerify;
        onExpireRef.current = onExpire;
        onErrorRef.current = onError;
      });

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

          // Do not re-render if already rendered for this instance
          if (widgetIdRef.current !== null) {
            return;
          }

          if (containerRef.current) {
            containerRef.current.innerHTML = "";
          }

          try {
            const id = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              theme,
              size,
              callback: (token: string) => {
                if (isMounted) onVerifyRef.current?.(token);
              },
              "expired-callback": () => {
                if (isMounted) onExpireRef.current?.();
              },
              "error-callback": (err: any) => {
                if (isMounted) onErrorRef.current?.(err);
              },
            });
            widgetIdRef.current = id;
          } catch (err) {
            console.error("Failed to render Cloudflare Turnstile:", err);
          }
        };

        loadTurnstileScript(() => {
          if (isMounted) renderWidget();
        });

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
      }, [siteKey, theme, size]);

      return (
        <div
          ref={containerRef}
          className={`turnstile_container ${className}`}
          style={{ minHeight: size === "compact" ? "120px" : "65px" }}
        />
      );
    }
  )
);

Turnstile.displayName = "Turnstile";
