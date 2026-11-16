import LoadingOverlay from "../../components/Loadingoverlay";
import { useAuth } from "../../auth/useAuth";
import { useEffect, useState } from "react";
import "./UserProfile.scss";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons";
import { InputField } from "../../components/InputFields/InputFields";
import { useResetPassword } from "../../auth/useResetPassword";
import { useForgotPassword } from "../../auth/useForgotPassword";
import { useUpdateUser, type UpdateUserPayload } from "../../hooks/useUsers";
import { toast } from "sonner";

const UserProfile = () => {
    const { data: profileDetails, isLoading } = useAuth();

    const details = [
        { label: "Email", value: profileDetails?.user?.email || "N/A" },
        { label: "Role", value: profileDetails?.user?.roles?.[0]?.name || "N/A" },
    ];

    const tabs = [
        "Profile",
        "Edit Profile",
        "Change Password",
        "2FA",
        "User Log"
    ];

    const [activeTab, setActiveTab] = useState("Profile");

    // Edit Profile Form State
    const [editForm, setEditForm] = useState({
        name: "",
        phone: "",
    });
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    const { mutateAsync: updateUser, isPending: isUpdatingProfile } = useUpdateUser();

    // Change Password Form State
    const [passwordForm, setPasswordForm] = useState({
        email: "",
        code: "",
        password: "",
        password_confirmation: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const { mutateAsync: resetPassword, isPending: isResetPending } = useResetPassword();
    const { mutateAsync: sendOtp, isPending: isSendingOtp } = useForgotPassword();

    // Initialize edit form and password email once profileDetails load
    useEffect(() => {
        const user = profileDetails?.user ?? profileDetails;
        if (user) {
            setEditForm({
                name: user.name || user.full_name || "",
                phone: user.phone || "",
            });
            if (user.email) {
                setPasswordForm((prev) => ({
                    ...prev,
                    email: prev.email || user.email,
                }));
            }
        }
    }, [profileDetails]);

    const handleEditProfileChange = (field: keyof typeof editForm) => (e: any) => {
        const val = typeof e === "string" ? e : (e?.target?.value ?? "");
        setEditForm((prev) => ({ ...prev, [field]: val }));
        if (editErrors[field]) {
            setEditErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleResetEditForm = () => {
        const user = profileDetails?.user ?? profileDetails;
        setEditForm({
            name: user?.name || user?.full_name || "",
            phone: user?.phone || "",
        });
        setEditErrors({});
    };

    const handleEditProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditErrors({});

        if (!editForm.name.trim()) {
            setEditErrors({ name: "Name is required" });
            return;
        }

        const user = profileDetails?.user ?? profileDetails;
        const userId = user?.id;

        if (!userId) {
            toast.error("User ID not found. Please refresh the page.");
            return;
        }

        try {
            const payload: UpdateUserPayload = {
                id: userId,
                name: editForm.name.trim(),
                full_name: editForm.name.trim(),
                phone: editForm.phone.trim(),
            };

            if (user?.email) {
                payload.email = user.email;
            }

            if (Array.isArray(user?.roles) && user.roles.length > 0) {
                payload.roles = user.roles.map((r: any) =>
                    typeof r === "string" ? r : (r.name || r.id)
                );
            }

            await updateUser(payload as any);
            toast.success("Profile updated successfully!");
        } catch (err: any) {
            const apiMsg = err?.response?.data?.message || "Failed to update profile. Please try again.";
            toast.error(apiMsg);

            const apiErrors = err?.response?.data?.errors;
            if (apiErrors && typeof apiErrors === "object") {
                const mapped: Record<string, string> = {};
                Object.entries(apiErrors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v[0] : String(v);
                });
                setEditErrors(mapped);
            }
        }
    };

    const handleSendOtp = async () => {
        const emailToSend = passwordForm.email || profileDetails?.user?.email;
        if (!emailToSend) {
            toast.error("User email is required to send OTP.");
            return;
        }

        try {
            await sendOtp({ email: emailToSend });
            toast.success(`OTP has been sent to ${emailToSend}. Please check your inbox.`);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to send OTP code. Please try again.";
            toast.error(msg);
        }
    };

    const handlePasswordChange = (field: keyof typeof passwordForm) => (e: any) => {
        const val = typeof e === "string" ? e : (e?.target?.value ?? "");
        setPasswordForm((prev) => ({ ...prev, [field]: val }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleResetForm = () => {
        setPasswordForm({
            email: profileDetails?.user?.email || "",
            code: "",
            password: "",
            password_confirmation: "",
        });
        setFormErrors({});
    };

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        const errors: Record<string, string> = {};
        const email = passwordForm.email || profileDetails?.user?.email;

        if (!email) {
            errors.email = "Email is required";
        }
        if (!passwordForm.code.trim()) {
            errors.code = "OTP or token code is required";
        }
        if (!passwordForm.password) {
            errors.password = "New password is required";
        } else if (passwordForm.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        if (!passwordForm.password_confirmation) {
            errors.password_confirmation = "Please confirm your new password";
        } else if (passwordForm.password !== passwordForm.password_confirmation) {
            errors.password_confirmation = "Passwords do not match";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const tokenOrCode = passwordForm.code.trim();
            const res = await resetPassword({
                email,
                token: tokenOrCode,
                code: tokenOrCode,
                password: passwordForm.password,
                password_confirmation: passwordForm.password_confirmation,
            });

            const successMsg = (res as any)?.message || "Password reset successfully!";
            toast.success(successMsg);

            setPasswordForm((prev) => ({
                ...prev,
                code: "",
                password: "",
                password_confirmation: "",
            }));
            setFormErrors({});
        } catch (err: any) {
            const apiMsg = err?.response?.data?.message || "Failed to reset password. Please check your OTP and try again.";
            toast.error(apiMsg);

            const apiErrors = err?.response?.data?.errors;
            if (apiErrors && typeof apiErrors === "object") {
                const mapped: Record<string, string> = {};
                Object.entries(apiErrors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v[0] : String(v);
                });
                setFormErrors(mapped);
            }
        }
    };

    ///////////////////////

    const renderValue = (val: any) => {
        if (val === null || val === undefined || val === "") return "-";
        if (val instanceof Date) {
            if (isNaN(val.getTime())) return "-";
            return val.toISOString().split("T")[0];
        }
        if (typeof val === "object") {
            return String(val);
        }
        return val;
    };

    if (isLoading) {
        return <LoadingOverlay isLoading={true} />
    }

    return (
        <div className="page_wrapper" >
            <div className="profile-page" >
                {/* <div className="breadcrumbs" ><span onClick={() => navigate(-1)} >Profile</span></div> */}

                <div className="profile-details-wrapper">
                    <div className="profile-details-header profile-details-section">
                        <div className="profile-header-wrapper" >
                            <img className="profile-photo" src={profileDetails?.user?.photo}
                                alt={profileDetails?.user?.name || "Profile"}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/user-square.svg";
                                }}
                            />
                            <div className="name-and-details" >
                                <h1>{`${profileDetails?.user?.name || "N/A"}`}</h1>

                                <div className="student-details">
                                    {details?.map((item: any) => (
                                        <div className="detail-item" key={item?.label}>
                                            <span className="label">{item?.label}</span>
                                            <span className="separator">:</span>
                                            <span className="value">{renderValue(item?.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-details-body profile-details-section">
                        <div className="profile-info-head" >
                            <p>User Info</p>
                        </div>

                        <div className="profile-tabs-wrapper" >
                            <div className="profile-tabs" >
                                {tabs?.map((tab: any) => (
                                    <button key={tab}
                                        className={`tab ${activeTab === tab ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab)} >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="tab-content">
                                {activeTab === "Profile" && (
                                    <div className="details-list">
                                        <div className="detail-row" >
                                            <div className="label">Full Name</div>
                                            <div className="value">{profileDetails?.user?.name}</div>
                                        </div>
                                        <div className="detail-row" >
                                            <div className="label">Email</div>
                                            <div className="value">{profileDetails?.user?.email}</div>
                                        </div>
                                        <div className="detail-row" >
                                            <div className="label">Phone</div>
                                            <div className="value">{profileDetails?.user?.phone}</div>
                                        </div>
                                        <div className="detail-row" >
                                            <div className="label">Role</div>
                                            <div className="value">{profileDetails?.user?.roles?.[0]?.name}</div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "Edit Profile" && (
                                    <div className="search_screen" style={{ padding: "24px" }} >
                                        <form onSubmit={handleEditProfileSubmit} className="popup_body" style={{ width: "100%", maxWidth: "600px" }}>
                                            <div className="fields_wrapper" >
                                                <div className="body_section" >
                                                    <InputField
                                                        type="text"
                                                        label="Name"
                                                        placeHolder="Enter your name"
                                                        name="name"
                                                        value={editForm.name}
                                                        onChange={handleEditProfileChange("name")}
                                                        error={editErrors.name}
                                                        required
                                                    />
                                                    <InputField
                                                        type="text"
                                                        label="Phone"
                                                        placeHolder="Enter your phone"
                                                        name="phone"
                                                        value={editForm.phone}
                                                        onChange={handleEditProfileChange("phone")}
                                                        error={editErrors.phone}
                                                    />
                                                </div>

                                                <div className="body_section" >
                                                    <InputField
                                                        type="email"
                                                        label="Email"
                                                        placeHolder="Email"
                                                        name="email"
                                                        value={profileDetails?.user?.email || "-"}
                                                        readOnly
                                                        disabled
                                                    />
                                                    <InputField
                                                        type="text"
                                                        label="Role"
                                                        placeHolder="Role"
                                                        name="role"
                                                        value={profileDetails?.user?.roles?.[0]?.name || "-"}
                                                        readOnly
                                                        disabled
                                                    />
                                                </div>
                                            </div>

                                            <div className="buttons" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                                                <SecondaryButton title="Reset" onClick={handleResetEditForm} />
                                                <PrimaryButton
                                                    type="submit"
                                                    title={isUpdatingProfile ? "Saving..." : "Save Changes"}
                                                    isLoading={isUpdatingProfile}
                                                    disabled={isUpdatingProfile}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === "Change Password" && (
                                    <div className="search_screen" style={{ padding: "24px" }} >
                                        <form onSubmit={handleSubmitPassword} className="popup_body" style={{ width: "100%", maxWidth: "600px" }}>
                                            <div className="fields_wrapper">
                                                <div className="body_section">
                                                    <InputField
                                                        type="email"
                                                        label="Email Address"
                                                        placeHolder="Enter your email"
                                                        name="email"
                                                        value={passwordForm.email}
                                                        onChange={handlePasswordChange("email")}
                                                        error={formErrors.email}
                                                        readOnly
                                                    />
                                                </div>

                                                <div className="body_section" style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                                                    <div style={{ flex: 1 }}>
                                                        <InputField
                                                            type="text"
                                                            label="OTP / Verification Code"
                                                            placeHolder="Enter 6-digit OTP code"
                                                            name="code"
                                                            value={passwordForm.code}
                                                            onChange={handlePasswordChange("code")}
                                                            error={formErrors.code}
                                                            required
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleSendOtp}
                                                        disabled={isSendingOtp}
                                                        style={{
                                                            height: "44px",
                                                            padding: "0 18px",
                                                            borderRadius: "8px",
                                                            border: "1px solid #605dec",
                                                            background: "#f4f2ff",
                                                            color: "#605dec",
                                                            fontWeight: 600,
                                                            fontSize: "13px",
                                                            cursor: isSendingOtp ? "not-allowed" : "pointer",
                                                            whiteSpace: "nowrap",
                                                            marginBottom: formErrors.code ? "22px" : "0",
                                                            transition: "all 0.2s ease",
                                                        }}
                                                    >
                                                        {isSendingOtp ? "Sending OTP..." : "Get OTP"}
                                                    </button>
                                                </div>

                                                <div className="body_section">
                                                    <InputField
                                                        type="password"
                                                        label="New Password"
                                                        placeHolder="Enter new password (min. 6 characters)"
                                                        name="password"
                                                        value={passwordForm.password}
                                                        onChange={handlePasswordChange("password")}
                                                        error={formErrors.password}
                                                        required
                                                    />
                                                    <InputField
                                                        type="password"
                                                        label="Confirm New Password"
                                                        placeHolder="Confirm new password"
                                                        name="password_confirmation"
                                                        value={passwordForm.password_confirmation}
                                                        onChange={handlePasswordChange("password_confirmation")}
                                                        error={formErrors.password_confirmation}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="buttons" >
                                                <SecondaryButton title="Reset" onClick={handleResetForm} />
                                                <PrimaryButton
                                                    type="submit"
                                                    title={isResetPending ? "Submitting..." : "Submit"}
                                                    isLoading={isResetPending}
                                                    disabled={isResetPending}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === "2FA" && (
                                    <div className="empty-page">2FA</div>
                                )}
                                {activeTab === "User Log" && (
                                    <div className="empty-page">User Log</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
