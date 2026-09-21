import { useState, useRef } from "react";
import { InputField } from "../../components/InputFields/InputFields";
import { PrimaryButton } from "../../components/Buttons/Buttons";
import "./Login.scss";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../auth/useLogin";
import { loginSchema } from "../../validations/authSchema";
import { validate } from "../../utils/validate";
import { useQueryClient } from "@tanstack/react-query";
import { Turnstile, type TurnstileRef } from "../../components/Turnstile/Turnstile";

const Login: React.FC = () => {

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<any>({});
    const [form, setForm] = useState({ email: "", password: "" });
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const turnstileRef = useRef<TurnstileRef>(null);

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
            onSuccess: async (res: any) => {
                localStorage.setItem("auth", JSON.stringify(res.data));
                queryClient.setQueryData(["auth"], res.data);
                queryClient.invalidateQueries({ queryKey: ["auth"] });
                queryClient.invalidateQueries({ queryKey: ["general-settings"] });
                navigate("/dashboard", { replace: true });
            },
            onError: (res: any) => {
                console.log("login error: ", res);
                turnstileRef.current?.reset();
                setTurnstileToken("");
            },
        });
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
                        <InputField
                            error={errors.password}
                            value={form.password}
                            onChange={handleChange("password")}
                            label="Password"
                            placeHolder="••••••••"
                            type="password"
                        />

                        {/* Cloudflare Turnstile Captcha */}
                        <div className="turnstile_wrapper">
                            <Turnstile
                                ref={turnstileRef}
                                onVerify={(token) => setTurnstileToken(token)}
                                onExpire={() => setTurnstileToken("")}
                                onError={() => setTurnstileToken("")}
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
                        />

                        {isError && (
                            <p className="error_text">
                                {(error as any)?.response?.data?.message || "Login failed. Please try again."}
                            </p>
                        )}
                    </form>
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