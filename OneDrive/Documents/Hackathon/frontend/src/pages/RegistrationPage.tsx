import EmptyState from "@/components/ui/EmptyState";
import { ClipboardList } from "lucide-react";

export default function RegistrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registration</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Register for hackathons and manage your team.
        </p>
      </div>
      <EmptyState
        icon={<ClipboardList className="h-10 w-10" />}
        title="Registration not open"
        description="Team registration forms will be available when hackathons go live."
      />
    </div>
  );
}
