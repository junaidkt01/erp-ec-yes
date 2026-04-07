import { useState } from "react";
import { InputField } from "../../components/InputFields/InputFields";
import { PrimaryButton } from "../../components/Buttons/Buttons";
import "./Login.scss";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../auth/useLogin";
import { loginSchema } from "../../validations/authSchema";
import { validate } from "../../utils/validate";
import { useAuth } from "../../auth/useAuth";

const Login: React.FC = () => {

    const navigate = useNavigate();
    const [errors, setErrors] = useState<any>({});
    const [form, setForm] = useState({ email: "", password: "" });
    const { mutateAsync: login, isPending, isError, error } = useLogin();

    const handleChange =
        (field: "email" | "password") =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({ ...prev, [field]: e.target.value }));
            };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { success, errors } = validate(loginSchema, form);
        if (!success) { setErrors(errors); return; }
        await login(form, {
            onSuccess: (res: any) => {
                localStorage.setItem("auth", JSON.stringify(res.data));
                navigate("/dashboard");
            },
            onError: (res: any) => console.log("login error: ", res),
        });
    };



    const { data } = useAuth();
    if (data) {
        navigate("/dashboard")
    }

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
                    {/* Brand mark */}
                    {/* <div className="brand_mark">
                        <div className="brand_icon">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <rect width="28" height="28" rx="8" fill="#7C3AED" />
                                <path d="M8 14L12.5 18.5L20 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="brand_name">YesIndia</span>
                    </div> */}

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

                        {/* <div className="forgot_row">
                            <a href="/forgot-password" className="forgot_link">Forgot password?</a>
                        </div> */}

                        <PrimaryButton
                            type="submit"
                            // disabled={isPending}
                            title={isPending ? "Signing in…" : "Sign in"}
                        />

                        {isError && (
                            <p className="error_text">
                                {(error as any)?.response?.data?.message || "Login failed. Please try again."}
                            </p>
                        )}
                    </form>

                    {/* <p className="login_footer">
                        Don't have an account?{" "}
                        <a href="/register" className="register_link">Create one</a>
                    </p> */}
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