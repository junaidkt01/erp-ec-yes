import React, { useState } from "react";
import PopupScreen from "../PopupScreen/PopupScreen";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import {
  useSetupTwoFactor,
  useConfirmTwoFactor,
  useDisableTwoFactor,
  type TwoFactorSetupResponse,
} from "../../auth/useTwoFactor";
import { useAuth } from "../../auth/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  AlertCircle,
  KeyRound,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import "./TwoFactorModal.scss";
import type { AxiosError } from "axios";

export interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();

  const isEnabled = Boolean(
    authData?.user?.two_factor_confirmed_at || authData?.user?.two_factor_enabled
  );

  const [mode, setMode] = useState<"view" | "setup" | "recovery_codes" | "confirm_disable">("view");
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse["data"] | null>(null);
  const [confirmCode, setConfirmCode] = useState<string>("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);
  const [copiedCodes, setCopiedCodes] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutateAsync: setup2FA, isPending: isSettingUp } = useSetupTwoFactor();
  const { mutateAsync: confirm2FA, isPending: isConfirming } = useConfirmTwoFactor();
  const { mutateAsync: disable2FA, isPending: isDisabling } = useDisableTwoFactor();

  if (!isOpen) return null;

  const handleStartSetup = async () => {
    try {
      setErrorMessage(null);
      const res = await setup2FA();
      if (res?.data) {
        setSetupData(res.data);
        setMode("setup");
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setErrorMessage(axiosErr?.response?.data?.message || "Failed to initiate 2FA setup. Please try again.");
    }
  };

  const handleConfirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = confirmCode.trim();
    if (cleanCode.length !== 6) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setErrorMessage(null);
      const res = await confirm2FA({ code: cleanCode });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      if (res?.recovery_codes && res.recovery_codes.length > 0) {
        setRecoveryCodes(res.recovery_codes);
        setMode("recovery_codes");
      } else {
        toast.success("Two-Factor Authentication enabled successfully!");
        handleClose();
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setErrorMessage(axiosErr?.response?.data?.message || "Invalid verification code. Please check your app and try again.");
    }
  };

  const handleDisable2FA = async () => {
    try {
      setErrorMessage(null);
      await disable2FA();
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Two-Factor Authentication disabled successfully.");
      setMode("view");
      handleClose();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setErrorMessage(axiosErr?.response?.data?.message || "Failed to disable 2FA. Please try again.");
    }
  };

  const copySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyRecoveryCodes = () => {
    if (!recoveryCodes.length) return;
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadRecoveryCodes = () => {
    const text = `YES School ERP - 2FA Recovery Codes\nAccount: ${authData?.user?.email || ""}\nDate: ${new Date().toLocaleDateString()}\n\nEach code can be used once to access your account:\n\n${recoveryCodes.join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `2fa-recovery-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setMode("view");
    setSetupData(null);
    setConfirmCode("");
    setRecoveryCodes([]);
    setErrorMessage(null);
    onClose();
  };

  return (
    <PopupScreen title="Two-Factor Authentication" onClick={handleClose}>
      <div className="two_factor_modal">
        {mode === "view" && (
          <>
            <div className={`status_card ${isEnabled ? "enabled" : "disabled"}`}>
              <div className="status_icon">
                {isEnabled ? <ShieldCheck size={26} /> : <ShieldAlert size={26} />}
              </div>
              <div className="status_info">
                <p className="status_title">
                  {isEnabled ? "2FA is currently Enabled" : "2FA is currently Disabled"}
                </p>
                <p className="status_desc">
                  {isEnabled
                    ? "Your account requires a verification code each time you sign in."
                    : "Add an extra layer of security using Google Authenticator or any TOTP app."}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="modal_error">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="modal_actions">
              <SecondaryButton title="Close" onClick={handleClose} />
              {isEnabled ? (
                <button
                  type="button"
                  className="button secondary_button"
                  style={{ color: "#dc2626", borderColor: "#fecaca" }}
                  onClick={() => setMode("confirm_disable")}
                >
                  Disable 2FA
                </button>
              ) : (
                <PrimaryButton
                  title={isSettingUp ? "Preparing…" : "Set Up 2FA"}
                  isLoading={isSettingUp}
                  onClick={handleStartSetup}
                />
              )}
            </div>
          </>
        )}

        {mode === "setup" && setupData && (
          <form onSubmit={handleConfirmSetup} className="setup_container">
            <div>
              <p className="setup_step_heading">1. Scan QR Code</p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 10px" }}>
                Open Google Authenticator or your authenticator app and scan this QR code:
              </p>
              <div className="qr_code_box">
                {setupData.qr_code_image ? (
                  <img
                    src={setupData.qr_code_image}
                    alt="2FA QR Code"
                    className="qr_image"
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "16px", color: "#6b7280", fontSize: "13px" }}>
                    Scan URI: <code>{setupData.qr_code_url}</code>
                  </div>
                )}

                <div className="secret_key_row">
                  <KeyRound size={14} color="#7c3aed" />
                  <code>{setupData.secret}</code>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="copy_btn"
                    title="Copy Secret"
                  >
                    {copiedSecret ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="verify_step">
              <p className="setup_step_heading">2. Verify 6-Digit Code</p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
                Enter the 6-digit verification code generated by your app to complete setup:
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={confirmCode}
                onChange={(e) => {
                  setConfirmCode(e.target.value.replace(/\D/g, ""));
                  setErrorMessage(null);
                }}
                placeholder="000000"
                className={`confirm_input ${errorMessage ? "input_error" : ""}`}
                autoFocus
              />
            </div>

            {errorMessage && (
              <div className="modal_error">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="modal_actions">
              <SecondaryButton
                title="Cancel"
                onClick={() => {
                  setMode("view");
                  setErrorMessage(null);
                }}
              />
              <PrimaryButton
                type="submit"
                disabled={isConfirming || confirmCode.trim().length !== 6}
                isLoading={isConfirming}
                title={isConfirming ? "Confirming…" : "Confirm & Enable"}
              />
            </div>
          </form>
        )}

        {mode === "recovery_codes" && (
          <div className="recovery_codes_box">
            <div className="recovery_alert">
              <AlertCircle size={22} className="alert_icon" />
              <div>
                <strong style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>
                  Save Your Emergency Recovery Codes
                </strong>
                <p className="alert_text">
                  If you lose access to your authenticator app, each of these recovery codes can be used once to log in. Store them safely.
                </p>
              </div>
            </div>

            <div className="codes_grid">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="code_chip">
                  {code}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={copyRecoveryCodes}
                className="button secondary_button"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                {copiedCodes ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCodes ? "Copied All" : "Copy Codes"}</span>
              </button>
              <button
                type="button"
                onClick={downloadRecoveryCodes}
                className="button secondary_button"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <Download size={14} />
                <span>Download .txt</span>
              </button>
            </div>

            <div className="modal_actions" style={{ marginTop: "12px" }}>
              <PrimaryButton
                title="I've Saved My Codes"
                onClick={handleClose}
              />
            </div>
          </div>
        )}

        {mode === "confirm_disable" && (
          <>
            <div className="status_card disabled">
              <div className="status_icon">
                <ShieldAlert size={26} color="#dc2626" />
              </div>
              <div className="status_info">
                <p className="status_title" style={{ color: "#b91c1c" }}>
                  Disable Two-Factor Authentication?
                </p>
                <p className="status_desc">
                  Disabling 2FA reduces account security. You will only need your password to log in.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="modal_error">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="modal_actions">
              <SecondaryButton
                title="Cancel"
                onClick={() => {
                  setMode("view");
                  setErrorMessage(null);
                }}
              />
              <button
                type="button"
                className="button primary_button"
                style={{ background: "#dc2626", borderColor: "#dc2626" }}
                disabled={isDisabling}
                onClick={handleDisable2FA}
              >
                {isDisabling ? "Disabling…" : "Yes, Disable 2FA"}
              </button>
            </div>
          </>
        )}
      </div>
    </PopupScreen>
  );
};

export default TwoFactorModal;
