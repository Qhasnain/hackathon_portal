import EmptyState from "@/components/ui/EmptyState";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Manage your account settings and preferences.
        </p>
      </div>
      <EmptyState
        icon={<User className="h-10 w-10" />}
        title="Profile settings coming soon"
        description="User profile and account management will be available after authentication is implemented."
      />
    </div>
  );
}
