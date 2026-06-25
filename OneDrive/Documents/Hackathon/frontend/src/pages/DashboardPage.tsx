import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import PageLoader from "@/components/ui/PageLoader";
import { ClipboardList, FileUp, Trophy } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["studentDashboardStats"],
    queryFn: dashboardService.getStudentStats,
  });

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="p-8 text-red-500">Failed to load dashboard stats.</div>;

  const kpis = [
    { label: "Active Hackathons", value: stats?.active_hackathons ?? 0, icon: <Trophy className="w-8 h-8" />, color: "bg-blue-500" },
    { label: "My Registrations", value: stats?.my_registrations ?? 0, icon: <ClipboardList className="w-8 h-8" />, color: "bg-green-500" },
    { label: "My Submissions", value: stats?.my_submissions ?? 0, icon: <FileUp className="w-8 h-8" />, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Student Dashboard</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Your hackathon overview and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white/60 backdrop-blur-xl border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
            <div className={`p-4 rounded-xl text-white ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      {stats?.active_hackathons === 0 && (
        <div className="mt-8 text-center p-12 bg-indigo-50/50 rounded-3xl border border-indigo-100">
          <Trophy className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready for a challenge?</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You are not participating in any active hackathons. Head over to the Hackathons page to find one!
          </p>
          <a
            href="/student/hackathons"
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Explore Hackathons
          </a>
        </div>
      )}
    </div>
  );
}
