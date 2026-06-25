import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Code2, Moon, Sun, User as UserIcon, Settings, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { ROUTES } from "@/routes/paths";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
  );

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate(ROUTES.LOGIN, { replace: true });
    toast.success("Logged out successfully.");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to={ROUTES.LANDING} className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Code2 className="h-6 w-6 text-primary-600" />
          <span className="hidden sm:inline">Hackathon Portal</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to={ROUTES.LANDING} className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to={ROUTES.STUDENT_HACKATHONS} className={navLinkClass}>
            Hackathons
          </NavLink>
          {isAuthenticated && (
            <NavLink to={user?.role === "ADMIN" ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD} className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {!isAuthenticated ? (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to={ROUTES.SIGNUP}>
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-slate-800 dark:text-primary-400 dark:hover:bg-slate-700"
              >
                <UserIcon className="h-5 w-5" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-800 dark:ring-slate-700 py-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.full_name}
                    </p>
                    <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-0.5">
                      {user?.role === "ADMIN" ? "Administrator" : "Student"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="py-1 border-b border-slate-100 dark:border-slate-700">
                    <Link
                      to={ROUTES.STUDENT_PROFILE}
                      onClick={() => setDropdownOpen(false)}
                      className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-primary-400"
                    >
                      <UserIcon className="mr-3 h-4 w-4 text-slate-400 group-hover:text-primary-600 dark:text-slate-500 dark:group-hover:text-primary-400" />
                      My Profile
                    </Link>
                    <button
                      disabled
                      className="group flex w-full items-center px-4 py-2 text-sm text-slate-400 cursor-not-allowed dark:text-slate-500"
                    >
                      <Settings className="mr-3 h-4 w-4 text-slate-300 dark:text-slate-600" />
                      Settings <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-slate-400">Coming Soon</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-red-500 dark:text-red-400" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
