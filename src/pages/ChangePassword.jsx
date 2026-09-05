import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const PASSWORD_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

const ChangePassword = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [step, setStep] = useState("old");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOldPasswordContinue = (e) => {
        e.preventDefault();
        setServerError("");

        if (!oldPassword) {
            setFieldErrors({ oldPassword: "Old password is required" });
            return;
        }

        setFieldErrors({});
        setStep("new");
    };

    const validateNewPassword = () => {
        const errors = {};

        if (!newPassword) {
            errors.newPassword = "New password is required";
        } else if (newPassword.length < 8) {
            errors.newPassword = "New password must be at least 8 characters";
        } else if (!PASSWORD_COMPLEXITY.test(newPassword)) {
            errors.newPassword = "New password must contain uppercase, lowercase and a number";
        } else if (newPassword === oldPassword) {
            errors.newPassword = "New password must be different from the current one";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your new password";
        } else if (confirmPassword !== newPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        if (isSubmitting) return;
        if (!validateNewPassword()) return;

        setIsSubmitting(true);
        try {
            await api.patch("/auth/change-password", { oldPassword, newPassword, confirmPassword });

            await logout();

            navigate("/login", {
                replace: true,
                state: { flashMessage: "Password changed successfully. Please log in again." },
            });
        } catch (err) {
            if (!err.response) {
                setServerError("Network error — please check your internet connection.");
            } else if (err.response.status === 401) {
                setStep("old");
                setFieldErrors({ oldPassword: "Old password is incorrect" });
            } else if (err.response.status === 400) {
                setServerError(err.response.data?.message || "Please check the details you entered.");
            } else {
                setServerError("Something went wrong. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-shell min-h-[calc(100vh-4rem)] px-4 py-10 sm:py-16">
            <div className="mx-auto max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl shadow-lg shadow-brand/30">
                        🔐
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-ink">Change Password</h1>
                    <p className="mt-2 text-sm text-muted">Keep your account safe with a strong password.</p>
                </div>

                <div className="card p-6 shadow-xl backdrop-blur sm:p-8">
                    <div className="mb-8">
                        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted">
                            <span className={step === "old" ? "text-brand" : "text-accent-active"}>
                                {step === "old" ? "1. Verify current password" : "2. Create new password"}
                            </span>
                            <span>{step === "old" ? "1 of 2" : "2 of 2"}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-canvas">
                            <div className={`h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500 ease-out ${step === "old" ? "w-1/2" : "w-full"}`} />
                        </div>
                    </div>

                    {step === "old" && (
                        <div key="old" className="step-panel animate-[fadeIn_350ms_ease-out]">
                            <form onSubmit={handleOldPasswordContinue} noValidate className="mt-8 space-y-5">
                                <div>
                                    <label htmlFor="oldPassword" className="field-label">Old Password</label>
                                    <div className="relative">
                                        <input
                                            id="oldPassword"
                                            type={showOldPassword ? "text" : "password"}
                                            placeholder="Enter your old password"
                                            value={oldPassword}
                                            onChange={(e) => {
                                                setOldPassword(e.target.value);
                                                if (fieldErrors.oldPassword) setFieldErrors({});
                                            }}
                                            autoComplete="current-password"
                                            aria-invalid={!!fieldErrors.oldPassword}
                                            aria-describedby={fieldErrors.oldPassword ? "oldPassword-error" : undefined}
                                            className={`input-field pr-11 ${fieldErrors.oldPassword ? "input-field-error" : ""}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword((v) => !v)}
                                            tabIndex={-1}
                                            aria-label={showOldPassword ? "Hide password" : "Show password"}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-ink-soft transition-colors duration-150"
                                        >
                                            {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {fieldErrors.oldPassword && (
                                        <p id="oldPassword-error" role="alert" className="field-error-text">
                                            {fieldErrors.oldPassword}
                                        </p>
                                    )}
                                </div>

                                <button type="submit" className="btn-primary w-full shadow-lg shadow-brand/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-brand/40">
                                    Continue
                                </button>
                            </form>
                        </div>
                    )}

                    {step === "new" && (
                        <div key="new" className="step-panel animate-[slideIn_400ms_ease-out]">
                            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                                <div>
                                    <label htmlFor="newPassword" className="field-label">New Password</label>
                                    <div className="relative">
                                        <input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            autoComplete="new-password"
                                            aria-invalid={!!fieldErrors.newPassword}
                                            aria-describedby={fieldErrors.newPassword ? "newPassword-error" : undefined}
                                            className={`input-field pr-11 ${fieldErrors.newPassword ? "input-field-error" : ""}`}
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
                                    {fieldErrors.newPassword && (
                                        <p id="newPassword-error" role="alert" className="field-error-text">
                                            {fieldErrors.newPassword}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="field-label">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            autoComplete="new-password"
                                            aria-invalid={!!fieldErrors.confirmPassword}
                                            aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                                            className={`input-field pr-11 ${fieldErrors.confirmPassword ? "input-field-error" : ""}`}
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
                                    {fieldErrors.confirmPassword && (
                                        <p id="confirmPassword-error" role="alert" className="field-error-text">
                                            {fieldErrors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                {serverError && (
                                    <p role="alert" className="text-sm text-danger bg-danger-subtle border border-danger/20 rounded-lg px-3 py-2">
                                        {serverError}
                                    </p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep("old")}
                                        disabled={isSubmitting}
                                        className="btn-secondary flex-1 transition-all duration-200 hover:-translate-x-0.5"
                                    >
                                        Back
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 shadow-lg shadow-brand/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-brand/40">
                                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isSubmitting ? "Changing..." : "Change Password"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;