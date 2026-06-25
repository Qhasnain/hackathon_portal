import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList,
  FileUp,
  LayoutDashboard,
  Trophy,
  User,
  Users,
  BarChart,
  LogOut
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

type SidebarLink = {
  to: string;
  label: string;
  icon: React.ElementType;
  comingSoon?: boolean;
};

const studentLinks: SidebarLink[] = [
  { to: ROUTES.STUDENT_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.STUDENT_HACKATHONS, label: "Hackathons", icon: Trophy },
  { to: ROUTES.STUDENT_REGISTRATION, label: "Registration", icon: ClipboardList },
  { to: ROUTES.STUDENT_SUBMISSION, label: "Submission", icon: FileUp },
];

const adminLinks: SidebarLink[] = [
  { to: ROUTES.ADMIN_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.ADMIN_HACKATHONS, label: "Hackathons", icon: Trophy },
  { to: ROUTES.ADMIN_PROBLEM_STATEMENTS, label: "Problem Statements", icon: FileUp },
  { to: "#", label: "Registrations", icon: ClipboardList, comingSoon: true },
  { to: "#", label: "Submissions", icon: FileUp, comingSoon: true },
  { to: "#", label: "Teams", icon: Users, comingSoon: true },
  { to: "#", label: "Analytics", icon: BarChart, comingSoon: true },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const isAdminPath = location.pathname.startsWith('/admin');
  const activeLinks = isAdminPath ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
    toast.success("Logged out successfully.");
  };

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:flex h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </p>
        <nav className="space-y-1">
          {activeLinks.map((link) => (
            link.comingSoon ? (
              <div
                key={link.label}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed dark:text-slate-500"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Coming Soon
                </span>
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            )
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <nav className="space-y-1">
          <NavLink
            to={ROUTES.STUDENT_PROFILE}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )
            }
          >
            <User className="h-4 w-4" />
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}
