import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-surface px-4 flex items-center justify-between sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:bg-canvas hover:text-ink transition-colors duration-150"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="group flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-brand text-white font-bold flex items-center justify-center text-sm transition-colors duration-150 group-hover:bg-brand-hover">
            M
          </span>
          <span className="hidden sm:block text-ink font-semibold text-lg tracking-tight transition-colors duration-150 group-hover:text-brand">
            Marginalia
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {user ? (
          <>
            <Link
              to="/create-blog"
              title="Add New Blog"
              aria-label="Add new blog"
              className="icon-badge w-9 h-9 text-lg font-medium"
            >
              +
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-ink-soft">{user.username}</span>
            </div>
          </>
        ) : (
          <Link
            to="/register"
            className="btn-primary text-sm px-4 py-2"
          >
            Register
          </Link>
        )}
      </div>
    </header>
  );
}
