import React, { useState, useRef, useEffect } from "react";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons";
import type { AxiosError } from "axios";
import { Turnstile, type TurnstileRef } from "../../components/Turnstile/Turnstile";
import { useVerifyTwoFactor, type AuthSessionData } from "../../auth/useTwoFactor";
import { twoFactorVerifySchema } from "../../validations/authSchema";
import { validate } from "../../utils/validate";
import { ShieldCheck, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";

export interface TwoFactorVerificationProps {
  email: string;
  challengeToken: string;
  onSuccess: (sessionData: AuthSessionData) => void;
  onCancel: () => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  email,
  challengeToken,
  onSuccess,
  onCancel,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [recoveryCode, setRecoveryCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const turnstileRef = useRef<TurnstileRef>(null);

  const { mutateAsync: verify, isPending } = useVerifyTwoFactor();

  // Focus the first input on mount
  useEffect(() => {
    if (!isRecoveryMode) {
      inputRefs.current[0]?.focus();
    }
  }, [isRecoveryMode]);

  const fullCode = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, "");

    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      setErrorMessage(null);
      return;
    }

    // Handle single digit input
    const nextDigits = [...digits];
    nextDigits[index] = cleaned[cleaned.length - 1]; // take the latest entered char
    setDigits(nextDigits);
    setErrorMessage(null);

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is already empty
        inputRefs.current[index - 1]?.focus();
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
        setErrorMessage(null);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (!pastedData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      if (i < pastedData.length) {
        nextDigits[i] = pastedData[i];
      }
    }
    setDigits(nextDigits);
    setErrorMessage(null);

    // Focus on the next empty or the last input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isPending || isExpired) return;

    const codeToSubmit = isRecoveryMode ? recoveryCode.trim() : fullCode;

    if (!isRecoveryMode && codeToSubmit.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    if (isRecoveryMode && codeToSubmit.length < 6) {
      setErrorMessage("Please enter a valid recovery code.");
      return;
    }

    const payload = {
      code: codeToSubmit,
      challenge_token: challengeToken,
      email,
    };

    const { success, errors } = validate(twoFactorVerifySchema, payload);
    if (!success) {
      setErrorMessage(errors.code || errors.challenge_token || "Invalid code format.");
      return;
    }

    try {
      setErrorMessage(null);
      const res = await verify({
        challenge_token: challengeToken,
        code: codeToSubmit,
        email,
        "cf-turnstile-response": turnstileToken,
        cf_turnstile_response: turnstileToken,
      });

      if (res?.data?.token) {
        onSuccess(res.data);
      } else {
        setErrorMessage("Verification succeeded but authenticated session was not returned.");
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const status = axiosErr?.response?.status;
      const apiMessage = axiosErr?.response?.data?.message;

      turnstileRef.current?.reset();
      setTurnstileToken("");

      if (status === 401) {
        setIsExpired(true);
        setErrorMessage("This verification session has expired. Please sign in again.");
      } else if (status === 422) {
        setErrorMessage(apiMessage || (isRecoveryMode ? "Invalid recovery code. Please try again." : "Invalid 2FA code. Please check your authenticator app and try again."));
      } else {
        setErrorMessage(apiMessage || "Verification failed. Please try again.");
      }
    }
  };

  return (
    <div className="two_factor_wrapper">
      <div className="two_factor_header">
        <div className="two_factor_icon_box">
          <ShieldCheck size={28} className="shield_icon" />
        </div>
        <div className="login_heading">
          <h1>Two-Factor Authentication</h1>
          <p>
            {isRecoveryMode
              ? "Enter one of your emergency recovery codes to access your account."
              : "Enter the 6-digit verification code from your authenticator app to complete sign-in."}
          </p>
        </div>
      </div>

      <div className="two_factor_account_chip">
        <KeyRound size={14} className="key_icon" />
        <span>Signing in as <strong>{email}</strong></span>
      </div>

      {isExpired ? (
        <div className="two_factor_expired_box">
          <div className="expired_content">
            <AlertCircle size={20} className="alert_icon" />
            <div>
              <p className="expired_title">Session Expired</p>
              <p className="expired_desc">
                Your temporary challenge token has expired for security. Please restart your login attempt.
              </p>
            </div>
          </div>
          <SecondaryButton
            title="Return to Login"
            onClick={onCancel}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="two_factor_form">
          {isRecoveryMode ? (
            <div className="otp_input_container">
              <label className="otp_label">Recovery Code</label>
              <input
                type="text"
                value={recoveryCode}
                onChange={(e) => {
                  setRecoveryCode(e.target.value.toUpperCase());
                  setErrorMessage(null);
                }}
                placeholder="e.g. AB3DE5GH1J"
                disabled={isPending}
                className={`otp_digit_input ${errorMessage ? "input_error" : ""}`}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  textAlign: "center",
                  letterSpacing: "2px",
                  fontSize: "18px",
                  height: "50px",
                }}
                autoFocus
              />
            </div>
          ) : (
            <div className="otp_input_container">
              <label className="otp_label">Verification Code</label>
              <div className="otp_inputs_group">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    disabled={isPending}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className={`otp_digit_input ${errorMessage ? "input_error" : ""} ${
                      digit ? "has_value" : ""
                    }`}
                    aria-label={`Digit ${idx + 1}`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <p
              className="forgot_password"
              style={{ cursor: "pointer", margin: "2px 0 0 0", fontSize: "13px" }}
              onClick={() => {
                setIsRecoveryMode(!isRecoveryMode);
                setErrorMessage(null);
              }}
            >
              {isRecoveryMode ? "Use authenticator app code instead" : "Lost access? Use a recovery code"}
            </p>
          </div>

          {/* Cloudflare Turnstile */}
          <div className="turnstile_wrapper">
            <Turnstile
              ref={turnstileRef}
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />
          </div>

          {errorMessage && (
            <div className="two_factor_error_alert">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="two_factor_actions">
            <PrimaryButton
              type="submit"
              disabled={isPending || (isRecoveryMode ? recoveryCode.trim().length < 6 : fullCode.length !== 6)}
              isLoading={isPending}
              title={isPending ? "Verifying…" : "Verify & Continue"}
            />

            <button
              type="button"
              className="back_to_login_btn"
              onClick={onCancel}
              disabled={isPending}
            >
              <ArrowLeft size={16} />
              <span>Back to sign in</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TwoFactorVerification;
