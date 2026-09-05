import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutGrid,
  FileText,
  BarChart2,
  PenSquare,
  Settings,
} from "lucide-react"; 

const linkBase = "nav-link";
const linkInactive = "";
const linkActive = "nav-link-active";

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="overlay animate-fade-in fixed inset-0 z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:static top-16 md:top-16 bottom-0 h-full left-0 z-40 md:h-[calc(100vh-4rem)]
          w-64 bg-surface border-r border-border
          px-3 py-6 shadow-xl md:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        <p className="px-3 mb-2 text-xs font-semibold text-muted uppercase tracking-wider">
          Navigation
        </p>

        <nav className="flex flex-col gap-1">
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <LayoutGrid className="w-4 h-4" />
            All Blogs
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/my-blogs"
                onClick={onClose}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                <FileText className="w-4 h-4" />
                Your Blogs
              </NavLink>

              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                <BarChart2 className="w-4 h-4" />
                Dashboard
              </NavLink>

              <NavLink
                to="/create-blog"
                onClick={onClose}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                <PenSquare className="w-4 h-4" />
                Create Blog
              </NavLink>

              <NavLink
                to="/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                <Settings className="w-4 h-4" />
                Profile Settings
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
