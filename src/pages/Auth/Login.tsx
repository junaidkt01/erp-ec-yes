import { useState, useRef, useCallback } from "react";
import { InputField } from "../../components/InputFields/InputFields";
import { PrimaryButton } from "../../components/Buttons/Buttons";
import "./Login.scss";
import { useNavigate } from "react-router-dom";
import { useLogin, type LoginResponsePayload } from "../../auth/useLogin";
import { loginSchema } from "../../validations/authSchema";
import { validate } from "../../utils/validate";
import { useQueryClient } from "@tanstack/react-query";
import { Turnstile, type TurnstileRef } from "../../components/Turnstile/Turnstile";
import type { AxiosError } from "axios";
import TwoFactorVerification from "./TwoFactorVerification";
import type { AuthSessionData } from "../../auth/useTwoFactor";
import { SIDEBAR_MENUS_KEY, RAW_SIDEBAR_MENUS_KEY } from "../../hooks/useSidebarMenus";

interface TwoFactorChallengeState {
    challengeToken: string;
    email: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({ email: "", password: "" });
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [twoFactorChallenge, setTwoFactorChallenge] = useState<TwoFactorChallengeState | null>(null);
    const turnstileRef = useRef<TurnstileRef>(null);

    const handleTurnstileVerify = useCallback((token: string) => {
        setTurnstileToken(token);
        setErrors((prev) => {
            if (!prev.turnstile) return prev;
            const updated = { ...prev };
            delete updated.turnstile;
            return updated;
        });
    }, []);

    const handleTurnstileExpire = useCallback(() => {
        setTurnstileToken("");
    }, []);

    const handleTurnstileError = useCallback(() => {
        setTurnstileToken("");
    }, []);

    const { mutateAsync: login, isPending, isError, error } = useLogin();

    const handleChange =
        (field: "email" | "password") =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({ ...prev, [field]: e.target.value }));
            };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...form, cf_turnstile_response: turnstileToken };
        const { success, errors } = validate(loginSchema, payload);
        if (!success) { setErrors(errors); return; }

        await login(payload, {
            onSuccess: async (res: LoginResponsePayload) => {
                // Check if the backend requires 2FA verification
                const challengeToken =
                    res?.challenge_token ||
                    (res as any)?.data?.challenge_token ||
                    (res as any)?.data?.token_challenge;

                const isTwoFactorRequired = Boolean(
                    challengeToken ||
                    res?.two_factor_required ||
                    (res as any)?.two_factor ||
                    (res?.data as Record<string, unknown> | undefined)?.two_factor_required
                );

                if (isTwoFactorRequired && challengeToken) {
                    setTwoFactorChallenge({
                        challengeToken,
                        email: form.email,
                    });
                    // Clear password from state for security
                    setForm((prev) => ({ ...prev, password: "" }));
                    setErrors({});
                    return;
                }

                // Normal login without 2FA
                if (res?.data) {
                    localStorage.setItem("auth", JSON.stringify(res.data));
                    queryClient.setQueryData(["auth"], res.data);
                    queryClient.invalidateQueries({ queryKey: ["auth"] });
                    queryClient.invalidateQueries({ queryKey: ["general-settings"] });
                    queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
                    queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
                    navigate("/dashboard", { replace: true });
                }
            },
            onError: (res: unknown) => {
                console.log("login error: ", res);
                turnstileRef.current?.reset();
                setTurnstileToken("");
            },
        });
    };

    const handleTwoFactorSuccess = (sessionData: AuthSessionData) => {
        localStorage.setItem("auth", JSON.stringify(sessionData));
        queryClient.setQueryData(["auth"], sessionData);
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        queryClient.invalidateQueries({ queryKey: ["general-settings"] });
        queryClient.invalidateQueries({ queryKey: SIDEBAR_MENUS_KEY });
        queryClient.invalidateQueries({ queryKey: RAW_SIDEBAR_MENUS_KEY });
        setTwoFactorChallenge(null);
        navigate("/dashboard", { replace: true });
    };

    const handleTwoFactorCancel = () => {
        setTwoFactorChallenge(null);
        setErrors({});
        turnstileRef.current?.reset();
        setTurnstileToken("");
    };

    return (
        <div className="login_page">
            {/* Left panel — hero image */}
            <div className="login_hero">
                <img
                    src="/login_bg_banner.png"
                    alt="Yes India Makes An Excellent India"
                    className="hero_image"
                />
                <div className="hero_overlay" />
                <div className="hero_badge">
                    <span className="badge_dot" />
                    Empowering Excellence
                </div>
            </div>

            {/* Right panel — form */}
            <div className="login_panel">
                <div className="login_inner">
                    {twoFactorChallenge ? (
                        <TwoFactorVerification
                            email={twoFactorChallenge.email}
                            challengeToken={twoFactorChallenge.challengeToken}
                            onSuccess={handleTwoFactorSuccess}
                            onCancel={handleTwoFactorCancel}
                        />
                    ) : (
                        <>
                            {/* Heading */}
                            <div className="login_heading">
                                <h1>Welcome back</h1>
                                <p>Sign in to continue building an excellent India.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="login_form">
                                <InputField
                                    error={errors.email}
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    label="Email"
                                    placeHolder="you@example.com"
                                    type="email"
                                />
                                <div>
                                    <InputField
                                        error={errors.password}
                                        value={form.password}
                                        onChange={handleChange("password")}
                                        label="Password"
                                        placeHolder="••••••••"
                                        type="password"
                                    />
                                    <p className="forgot_password" onClick={() => navigate("/forgot-password")}>Forget password?</p>
                                </div>

                                {/* Cloudflare Turnstile Captcha */}
                                <div className="turnstile_wrapper">
                                    <Turnstile
                                        ref={turnstileRef}
                                        theme="light"
                                        onVerify={handleTurnstileVerify}
                                        onExpire={handleTurnstileExpire}
                                        onError={handleTurnstileError}
                                    />
                                    {errors.turnstile && (
                                        <p className="error_text" style={{ fontSize: "12px", marginTop: "4px" }}>
                                            {errors.turnstile}
                                        </p>
                                    )}
                                </div>

                                <PrimaryButton
                                    type="submit"
                                    title={isPending ? "Signing in…" : "Sign in"}
                                    isLoading={isPending}
                                />

                                {isError && (
                                    <p className="error_text">
                                        {(error as AxiosError<{ message?: string }>)?.response?.data?.message || "Login failed. Please try again."}
                                    </p>
                                )}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;


// import { useState } from "react";
// import { InputField } from "../../components/InputFields/InputFields";
// import { PrimaryButton } from "../../components/Buttons/Buttons";
// import "./Login.scss";
// import { useNavigate } from "react-router-dom";
// import { useLogin } from "../../auth/useLogin";
// import { loginSchema } from "../../validations/authSchema";
// import { validate } from "../../utils/validate";

// const Login: React.FC = () => {
//     const navigate = useNavigate();

//     const [errors, setErrors] = useState<any>({});
//     console.log("errors: ", errors)
//     const [form, setForm] = useState({
//         email: "",
//         password: "",
//     });

//     const { mutateAsync: login, isPending, isError, error } = useLogin();

//     const handleChange =
//         (field: "email" | "password") =>
//             (e: React.ChangeEvent<HTMLInputElement>) => {
//                 setForm((prev) => ({
//                     ...prev,
//                     [field]: e.target.value,
//                 }));
//             };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         const { success, errors } = validate(loginSchema, form);

//         if (!success) {
//             setErrors(errors);
//             return;
//         }


//         await login(form, {
//             onSuccess: (res: any) => {
//                 console.log("login success: ", res.data)
//                 localStorage.setItem("auth", JSON.stringify(res.data));
//                 navigate("/dashboard");
//                 // navigate("/dashboard", { replace: true });
//             },
//             onError: (res: any) => {
//                 console.log("login error: ", res)
//             },
//         });
//     };

//     return (
//         <div className="login_page">
//             <div className="login_form">
//                 <form onSubmit={handleSubmit}>
//                     <InputField
//                         error={errors.email}
//                         value={form.email}
//                         onChange={handleChange("email")}
//                         label="Email"
//                         placeHolder="Please enter your email"
//                         type="email"
//                     />

//                     <InputField
//                         error={errors.password}
//                         value={form.password}
//                         onChange={handleChange("password")}
//                         label="Password"
//                         placeHolder="Please enter your password"
//                         type="password"
//                     />

//                     <PrimaryButton
//                         type="submit"
//                         disabled={!errors || isPending}
//                         title={isPending ? "Logging in..." : "Login"}
//                     />

//                     {isError && (
//                         <p className="error_text">
//                             {(error as any)?.response?.data?.message ||
//                                 "Login failed"}
//                         </p>
//                     )}
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Login;