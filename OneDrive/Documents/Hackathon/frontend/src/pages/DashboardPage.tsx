import EmptyState from "@/components/ui/EmptyState";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Your hackathon overview and activity feed.
        </p>
      </div>
      <EmptyState
        icon={<LayoutDashboard className="h-10 w-10" />}
        title="Dashboard coming soon"
        description="Participant stats, upcoming events, and notifications will appear here."
      />
    </div>
  );
}
