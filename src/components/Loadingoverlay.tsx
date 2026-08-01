import { useEffect, useState } from "react";

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

const ArcSpinner = () => (
    <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        className="animate-spin"
        style={{ animationDuration: "2.4s", animationTimingFunction: "linear" }}
    >
        <circle cx="22" cy="22" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <circle
            cx="22"
            cy="22"
            r="14"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="88"
            strokeDashoffset="22"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
    </svg>
);

export function ErrorStatusOverlay({ isError, status }: { isError: boolean, status: number | null, message: string }) {
    const [visible, setVisible] = useState(isError);
    const [opacity, setOpacity] = useState(isError ? 1 : 0);

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
                    pointerEvents: isError ? "all" : "none",
                }}
                aria-live="polite"
                aria-label={status ? `Error ${status}` : "Error"}
            // aria-label="Error"
            >
                <ArcSpinner />
            </div>
        </>
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