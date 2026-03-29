import { useState } from "react";
import { InputField } from "../../components/InputFields/InputFields";
import { PrimaryButton } from "../../components/Buttons/Buttons";
import "./Login.scss";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../auth/useLogin";

const Login: React.FC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    console.log(form)
    const isFormValid =
        form.email.trim().length > 0 &&
        form.password.trim().length > 0;

    const { mutateAsync: login, isPending, isError, error } = useLogin();

    const handleChange =
        (field: "email" | "password") =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                }));
            };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        await login(form, {
            onSuccess: (res: any) => {
                console.log("login success: ", res)
                localStorage.setItem("auth", res.data);
                navigate("/dashboard", { replace: true });
            },
            onError: (res: any) => {
                console.log("login error: ", res)
            },
        });
    };

    return (
        <div className="login_page">
            <div className="login_form">
                <form onSubmit={handleSubmit}>
                    <InputField
                        value={form.email}
                        onChange={handleChange("email")}
                        label="Email"
                        placeHolder="Please enter your email"
                        type="email"
                    />

                    <InputField
                        value={form.password}
                        onChange={handleChange("password")}
                        label="Password"
                        placeHolder="Please enter your password"
                        type="password"
                    />

                    <PrimaryButton
                        type="submit"
                        disabled={!isFormValid || isPending}
                        title={isPending ? "Logging in..." : "Login"}
                    />

                    {isError && (
                        <p className="error_text">
                            {(error as any)?.response?.data?.message ||
                                "Login failed"}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;