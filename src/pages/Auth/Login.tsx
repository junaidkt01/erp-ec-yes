import { useState } from "react";
import { InputField } from "../../components/InputFields/InputFields";
import { PrimaryButton } from "../../components/Buttons/Buttons";
import "./Login.scss";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../auth/useLogin";
import { loginSchema } from "../../validations/authSchema";
import { validate } from "../../utils/validate";

const Login: React.FC = () => {
    const navigate = useNavigate();

    const [errors, setErrors] = useState<any>({});
    console.log("errors: ", errors)
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

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

        const { success, errors } = validate(loginSchema, form);

        if (!success) {
            setErrors(errors);
            return;
        }


        await login(form, {
            onSuccess: (res: any) => {
                console.log("login success: ", res.data)
                localStorage.setItem("auth", JSON.stringify(res.data));
                navigate("/dashboard");
                // navigate("/dashboard", { replace: true });
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
                        error={errors.email}
                        value={form.email}
                        onChange={handleChange("email")}
                        label="Email"
                        placeHolder="Please enter your email"
                        type="email"
                    />

                    <InputField
                        error={errors.password}
                        value={form.password}
                        onChange={handleChange("password")}
                        label="Password"
                        placeHolder="Please enter your password"
                        type="password"
                    />

                    <PrimaryButton
                        type="submit"
                        disabled={!errors || isPending}
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