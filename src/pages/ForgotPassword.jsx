import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const RESEND_COOLDOWN = 60;
const MAX_OTP_ATTEMPTS = 5;

export default function ForgotPassword() {
    const [step, setStep] = useState("email")
    const [otp, setOtp] = useState("")
    const [resetToken, setResetToken] = useState("")
    const [email, setEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [fieldsErrors, setFieldsErrors] = useState({})
    const [serverError, setSeverError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [infoMessage, setInfoMessage] = useState("")
    const [otpAttempts, setOtpAttempts] = useState(0)

    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [resendCooldown, setResendCooldown] = useState(0)
    const { logout } = useAuth();
    const cooldownRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        return () => clearInterval(cooldownRef.current)
    }, [])

    const startCooldown = () => {
        setResendCooldown(RESEND_COOLDOWN)
        clearInterval(cooldownRef.current)

        cooldownRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current);
                    return 0;
                }
                return prev - 1;
            })
        }, 1000);
    }

    const resetAllState = () => {
        setStep("email");

        setOtp("")
        setResetToken("")
        setConfirmPassword("");
        setFieldsErrors({})
        setNewPassword("")
        setInfoMessage("")
        setSeverError("")
        setOtpAttempts(0)
        setShowNewPassword(false)
        setShowConfirmPassword(false)

        clearInterval(cooldownRef.current)
        setResendCooldown(0)
    }

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setSeverError("")
        setFieldsErrors({})

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setFieldsErrors((prev) => ({
                ...prev,
                email: "Email is required"
            }))
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setFieldsErrors((prev) => ({
                ...prev,
                email: "Please enter an valid email address"
            }))
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true)

        try {
            await api.post("/auth/forgot-password", {
                email: trimmedEmail.toLowerCase()
            })

            setInfoMessage("If an account of this email is exist ,an OTP has been send")
            setEmail(trimmedEmail.toLowerCase())
            setStep("otp")
            startCooldown()
        } catch (error) {
            if (!error.response) {
                setSeverError("Network Error, Please check your internet connection")
            } else if (error.response.status === 429) {
                setSeverError("Please wait a bit before try again")
            } else {
                setSeverError("SomeThing went wrong ,Please try again")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || isSubmitting) return;

        setSeverError("")
        setIsSubmitting(true)

        try {
            await api.post("/auth/forgot-password", { email })

            setInfoMessage("A new OTP has been send")

            setOtpAttempts(0)

            startCooldown();
        } catch (error) {
            setSeverError(
                !error.response ? "Network Error please check your internet connection" : "could not resend OTP"
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        setSeverError("")
        setFieldsErrors({})
        const trimmedOTP = otp.trim();

        if (!/^\d{6}$/.test(trimmedOTP)) {
            setFieldsErrors((prev) => ({
                ...prev,
                otp: "Enter the 6-digit code"
            }))
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true)

        try {
            const response = await api.post("/auth/verify-otp", { email, otp: trimmedOTP })

            const resetToken = response.data.resetToken || response?.data?.data?.resetToken
            setResetToken(resetToken)

            setStep("reset-password")
            setInfoMessage("")
        } catch (error) {
            if (!error.response) {
                setSeverError("Network Error please check your internet connection")
            } else {
                const nextAttempts = otpAttempts + 1;

                setOtpAttempts(nextAttempts)

                if (error.response.status === 410) {
                    setSeverError("This OTP has expired ,Please request a new one.")
                } else if (nextAttempts >= MAX_OTP_ATTEMPTS) {
                    setSeverError("Too many incorrect Attempts.Please restart the process")

                    setTimeout(resetAllState, 2500);
                } else {
                    setSeverError(`Incorrect OTP ${MAX_OTP_ATTEMPTS} attempts remaining`)
                }

            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleResetSubmit = async (e) => {
        e.preventDefault();

        setSeverError("")
        setFieldsErrors({})

        const errors = {};

        if (!newPassword) {
            errors.newPassword = "New password is required";
        } else if (newPassword.length < 8) {
            errors.newPassword = "New password must be at least 8 characters";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            errors.newPassword = "New password must contain uppercase, lowercase and a number";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your new password";
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = "Confirm password must be the same as the new password";
        }

        if (Object.keys(errors).length > 0) {
            setFieldsErrors(errors);
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true)

        try {
            const response = await api.patch("/auth/reset-password", {
                resetToken,
                newPassword,
                confirmPassword
            })

            await logout();

            navigate("/login", {
                replace: true,
                state: {
                    flashMessage: "Password reset successfully,Please login again"
                },
            });
        } catch (error) {
            if (!error.response) {
                setSeverError("Network Error please check your internet connection")
            } else if (error.response.status === 401 || error.response?.status === 410) {
                setSeverError("Your Session has been expired .Please restart the process")

                setTimeout(resetAllState, 2500)
            } else {
                setSeverError("SomeThing went wrong ,Please try again")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const stepIndex = step === "email" ? 0 : step === "otp" ? 1 : 2

    return (
        <div className="page-shell relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-10 sm:py-16">
            <style>{`
                @keyframes forgotPasswordEnter {
                    from { opacity: 0; transform: translateY(14px) scale(.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .forgot-password-step { animation: forgotPasswordEnter .35s ease-out both; }
            `}</style>
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

            <div className="relative mx-auto max-w-md">
                <div className="mb-7 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl shadow-lg shadow-brand/30">🔐</div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">Account recovery</p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-ink">Forgot your password?</h1>
                    <p className="mt-2 text-sm text-muted">A few quick steps and you’ll be back in.</p>
                </div>

                <div className="mb-5 rounded-2xl border border-border bg-surface/70 p-4 shadow-sm backdrop-blur">
                    <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted">
                        <span>Step {stepIndex + 1} of 3</span>
                        <span className="text-brand">{step === "email" ? "Your email" : step === "otp" ? "Verify code" : "New password"}</span>
                    </div>
                    <div className="flex gap-2">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${item <= stepIndex ? "bg-gradient-to-r from-brand to-accent" : "bg-border"}`} />
                        ))}
                    </div>
                </div>

                {step === "email" && (
                    <div key="email" className="forgot-password-step card p-6 shadow-xl sm:p-8">
                        <h2 className="text-xl font-bold text-ink">Let’s find your account</h2>
                        <p className="mt-1 text-sm text-muted">Enter your email and we’ll send you a one-time code.</p>

                        <form onSubmit={handleEmailSubmit} noValidate className="mt-7 space-y-5">
                            <div>
                                <label htmlFor="email" className="field-label">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    placeholder="Enter your Email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-invalid={!!fieldsErrors.email}
                                    className={`input-field ${fieldsErrors.email ? "input-field-error" : ""}`}
                                />
                                {fieldsErrors.email && (
                                    <p className="field-error-text">{fieldsErrors.email}</p>
                                )}
                            </div>

                            {serverError && (
                                <p role="alert" className="text-sm text-danger bg-danger-subtle border border-danger/20 rounded-lg px-3 py-2">
                                    {serverError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? "Sending..." : "Send OTP"}
                            </button>
                        </form>
                    </div>
                )}

                {step === "otp" && (
                    <div key="otp" className="forgot-password-step card p-6 shadow-xl sm:p-8">
                        <h2 className="text-xl font-bold text-ink">Check your inbox</h2>
                        <p className="mt-1 text-sm text-muted">We sent a 6-digit code to <span className="font-semibold text-ink-soft">{email}</span></p>

                        <form onSubmit={handleOtpSubmit} noValidate className="mt-7 space-y-5">
                            <div>
                                <label htmlFor="otp" className="field-label">Verification code</label>
                                <input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    aria-invalid={!!fieldsErrors.otp}
                                    className={`input-field tracking-[0.5em] text-center font-semibold ${fieldsErrors.otp ? "input-field-error" : ""}`}
                                />
                                {fieldsErrors.otp && (
                                    <p className="field-error-text">{fieldsErrors.otp}</p>
                                )}
                            </div>

                            {infoMessage && (
                                <p className="text-sm text-brand-active bg-brand-subtle rounded-lg px-3 py-2">{infoMessage}</p>
                            )}

                            {serverError && (
                                <p role="alert" className="text-sm text-danger bg-danger-subtle border border-danger/20 rounded-lg px-3 py-2">
                                    {serverError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? "Verifying..." : "Verify"}
                            </button>

                            <button
                                type="button"
                                disabled={resendCooldown > 0 || isSubmitting}
                                onClick={handleResendOtp}
                                className="btn-secondary w-full"
                            >
                                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                            </button>

                            <button
                                type="button"
                                onClick={resetAllState}
                                className="w-full text-sm text-muted hover:text-brand-active transition-colors duration-150 text-center"
                            >
                                Use a different email
                            </button>
                        </form>
                    </div>
                )}

                {step === "reset-password" && (
                    <div key="reset-password" className="forgot-password-step card p-6 shadow-xl sm:p-8">
                        <h2 className="text-xl font-bold text-ink">Create a new password</h2>
                        <p className="mt-1 text-sm text-muted">Choose a strong password you haven’t used before.</p>

                        <form onSubmit={handleResetSubmit} noValidate className="mt-7 space-y-5">
                            <div>
                                <label htmlFor="newPassword" className="field-label">New password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        name="newPassword"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setFieldsErrors((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
                                        }}
                                        autoComplete="new-password"
                                        aria-invalid={!!fieldsErrors.newPassword}
                                        className={`input-field pr-11 ${fieldsErrors.newPassword ? "input-field-error" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-ink-soft transition-colors duration-150"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldsErrors.newPassword && (
                                    <p className="field-error-text">{fieldsErrors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="field-label">Confirm password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setFieldsErrors((prev) => ({ ...prev, confirmPassword: "" }));
                                        }}
                                        autoComplete="new-password"
                                        aria-invalid={!!fieldsErrors.confirmPassword}
                                        className={`input-field pr-11 ${fieldsErrors.confirmPassword ? "input-field-error" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        tabIndex={-1}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-ink-soft transition-colors duration-150"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldsErrors.confirmPassword && (
                                    <p className="field-error-text">{fieldsErrors.confirmPassword}</p>
                                )}
                            </div>

                            {serverError && (
                                <p role="alert" className="text-sm text-danger bg-danger-subtle border border-danger/20 rounded-lg px-3 py-2">
                                    {serverError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isSubmitting ? "Resetting Password..." : "Reset Password"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}