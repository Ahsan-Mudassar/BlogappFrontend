import { useState } from "react";
import { KeyRound, HelpCircle, LogOut, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Settings = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setLogoutError("Something went wrong, but you have been logged out locally.");
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12 px-4 sm:px-6 lg:px-8">
      <div className="card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>

        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-border bg-canvas p-4">
            <label className="block text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Email Address
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink-soft shadow-sm">
              <Mail className="h-4 w-4 text-brand" />
              <span className="truncate font-medium text-ink">
                {user?.email || "No email available"}
              </span>
            </div>
          </div>

          <Link
            to="/change-password"
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-brand hover:bg-brand-subtle hover:text-brand"
          >
            <KeyRound className="h-4 w-4 text-brand" />
            Change Password
          </Link>

          <Link
            to="/forgot-password"
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-brand hover:bg-brand-subtle hover:text-brand"
          >
            <HelpCircle className="h-4 w-4 text-brand" />
            Forgot Password
          </Link>

          {logoutError && (
            <p role="alert" className="rounded-lg border border-danger/20 bg-danger-subtle px-3 py-2 text-sm text-danger">
              {logoutError}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn-primary w-full py-3"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;