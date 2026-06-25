import { Link, NavLink } from "react-router-dom";
import { Code2, Moon, Sun } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { ROUTES } from "@/routes/paths";
import { isAuthenticated } from "@/lib/auth";
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
  const authenticated = isAuthenticated();

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
          {authenticated && (
            <NavLink to={ROUTES.STUDENT_DASHBOARD} className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {!authenticated ? (
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
            <Link to={ROUTES.STUDENT_PROFILE}>
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
