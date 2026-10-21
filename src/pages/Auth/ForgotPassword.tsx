import { useState, useEffect } from "react";
import { InputField } from "../../components/InputFields/InputFields";
import { PrimaryButton } from "../../components/Buttons/Buttons";
import "./Login.scss";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForgotPassword } from "../../auth/useForgotPassword";
import { useResetPassword } from "../../auth/useResetPassword";
import { forgotPasswordSchema, resetPasswordSchema } from "../../validations/authSchema";
import { validate } from "../../utils/validate";
import { toast } from "sonner";

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const { email: pathEmail, token: pathToken } = useParams<{ email?: string; token?: string }>();
    const [searchParams] = useSearchParams();

    const rawEmail = pathEmail || searchParams.get("email") || "";
    const rawToken = pathToken || searchParams.get("token") || "";

    const isResetMode = Boolean(rawEmail && rawToken);
    const decodedEmail = rawEmail ? decodeURIComponent(rawEmail) : "";

    const [errors, setErrors] = useState<any>({});
    const [form, setForm] = useState({
        email: decodedEmail || "",
        password: "",
        password_confirmation: "",
    });
    const [successMessage, setSuccessMessage] = useState<string>("");

    useEffect(() => {
        if (decodedEmail) {
            setForm((prev) => ({ ...prev, email: decodedEmail }));
        }
    }, [decodedEmail]);

    const { mutateAsync: forgotPassword, isPending: isForgotPending, isError: isForgotError, error: forgotError } = useForgotPassword();
    const { mutateAsync: resetPassword, isPending: isResetPending, isError: isResetError, error: resetError } = useResetPassword();

    const isPending = isForgotPending || isResetPending;
    const isError = isForgotError || isResetError;
    const error = forgotError || resetError;

    const handleChange =
        (field: "email" | "password" | "password_confirmation") =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({ ...prev, [field]: e.target.value }));
                if (errors[field]) {
                    setErrors((prev: any) => ({ ...prev, [field]: undefined }));
                }
            };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");

        if (isResetMode) {
            const payload = {
                password: form.password,
                password_confirmation: form.password_confirmation,
            };
            const { success, errors: validationErrors } = validate(resetPasswordSchema, payload);
            if (!success) {
                setErrors(validationErrors);
                return;
            }

            await resetPassword(
                {
                    email: decodedEmail || form.email,
                    token: rawToken,
                    code: rawToken,
                    password: form.password,
                    password_confirmation: form.password_confirmation,
                },
                {
                    onSuccess: (res: any) => {
                        const message = res?.message || "Password reset successfully! Please sign in with your new password.";
                        setSuccessMessage(message);
                        toast.success(message);
                        setTimeout(() => {
                            navigate("/", { replace: true });
                        }, 1500);
                    },
                    onError: (err: any) => {
                        console.log("Reset password error: ", err);
                    },
                }
            );
        } else {
            const payload = { email: form.email };
            const { success, errors: validationErrors } = validate(forgotPasswordSchema, payload);
            if (!success) {
                setErrors(validationErrors);
                return;
            }

            await forgotPassword(
                payload,
                {
                    onSuccess: (res: any) => {
                        const message = res?.message || "Password reset instructions have been sent to your email.";
                        setSuccessMessage(message);
                        toast.success(message);
                    },
                    onError: (err: any) => {
                        console.log("Forgot password error: ", err);
                    },
                }
            );
        }
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
                        <h1>{isResetMode ? "Reset Password" : "Forgot Password"}</h1>
                        <p>
                            {isResetMode
                                ? `Enter your new password below for ${decodedEmail}.`
                                : "Enter your registered email address to receive password reset instructions."}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login_form">
                        {!isResetMode ? (
                            <InputField
                                error={errors.email}
                                value={form.email}
                                onChange={handleChange("email")}
                                label="Email"
                                placeHolder="you@example.com"
                                type="email"
                            />
                        ) : (
                            <>
                                <InputField
                                    error={errors.password}
                                    value={form.password}
                                    onChange={handleChange("password")}
                                    label="New Password"
                                    placeHolder="••••••••"
                                    type="password"
                                />

                                <InputField
                                    error={errors.password_confirmation}
                                    value={form.password_confirmation}
                                    onChange={handleChange("password_confirmation")}
                                    label="Confirm New Password"
                                    placeHolder="••••••••"
                                    type="password"
                                />
                            </>
                        )}

                        <PrimaryButton
                            type="submit"
                            title={
                                isPending
                                    ? isResetMode
                                        ? "Resetting password…"
                                        : "Sending link…"
                                    : isResetMode
                                        ? "Reset Password"
                                        : "Send Reset Link"
                            }
                        />

                        {successMessage && (
                            <p className="success_text" style={{ color: "#16a34a", fontSize: "14px", marginTop: "8px" }}>
                                {successMessage}
                            </p>
                        )}

                        {isError && (
                            <p className="error_text">
                                {(error as any)?.response?.data?.message ||
                                    (isResetMode
                                        ? "Failed to reset password. Please try again."
                                        : "Failed to send reset link. Please try again.")}
                            </p>
                        )}

                        <p
                            className="forgot_password"
                            style={{ textAlign: "center", marginTop: "12px", cursor: "pointer" }}
                            onClick={() => navigate("/")}
                        >
                            Back to Sign in
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;