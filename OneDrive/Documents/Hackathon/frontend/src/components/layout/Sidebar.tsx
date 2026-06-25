import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  FileUp,
  LayoutDashboard,
  Trophy,
  User,
} from "lucide-react";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/lib/utils";

import { useLocation } from "react-router-dom";

const studentLinks = [
  { to: ROUTES.STUDENT_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.STUDENT_HACKATHONS, label: "Hackathons", icon: Trophy },
  { to: ROUTES.STUDENT_REGISTRATION, label: "Registration", icon: ClipboardList },
  { to: ROUTES.STUDENT_SUBMISSION, label: "Submission", icon: FileUp },
  { to: ROUTES.STUDENT_PROFILE, label: "Profile", icon: User },
];

const adminLinks = [
  { to: ROUTES.ADMIN_DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.ADMIN_HACKATHONS, label: "Hackathons", icon: Trophy },
  { to: ROUTES.ADMIN_PROBLEM_STATEMENTS, label: "Problem Statements", icon: FileUp },
];

export default function Sidebar() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const activeLinks = isAdminPath ? adminLinks : studentLinks;
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:block">
      <div className="sticky top-16 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </p>
        <nav className="space-y-1">
          {activeLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-6 px-3 text-xs text-slate-400">
          Sidebar placeholder — full navigation coming soon.
        </p>
      </div>
    </aside>
  );
}
