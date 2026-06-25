import React from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import PageLoader from "@/components/ui/PageLoader";

const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: dashboardService.getStats,
  });

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="p-8 text-red-500">Failed to load dashboard stats.</div>;

  const kpis = [
    { label: "Total Hackathons", value: stats?.total_hackathons ?? 0, icon: "🏆", color: "bg-blue-500" },
    { label: "Total Teams", value: stats?.total_teams ?? 0, icon: "👥", color: "bg-purple-500" },
    { label: "Total Registrations", value: stats?.total_registrations ?? 0, icon: "📝", color: "bg-green-500" },
    { label: "Total Submissions", value: stats?.total_submissions ?? 0, icon: "🚀", color: "bg-orange-500" },
  ];

  const isEmpty = stats?.total_hackathons === 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-600">Live statistics and metrics for all hackathons.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white/60 backdrop-blur-xl border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
            <div className={`p-4 rounded-xl text-white text-2xl ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {isEmpty && (
        <div className="mt-12 text-center p-16 bg-gradient-to-b from-gray-50 to-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to launch your first Hackathon?</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            There are currently no hackathons in the system. Create one now and start accepting registrations!
          </p>
          <a
            href="/admin/hackathons/new"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Create New Hackathon
          </a>
        </div>
      )}

      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upcoming</span>
                  <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{stats?.status_distribution.upcoming}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Registration Open</span>
                  <span className="font-semibold text-green-900 bg-green-100 px-3 py-1 rounded-full">{stats?.status_distribution.registration_open}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Submission Open</span>
                  <span className="font-semibold text-yellow-900 bg-yellow-100 px-3 py-1 rounded-full">{stats?.status_distribution.submission_open}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Closed</span>
                  <span className="font-semibold text-red-900 bg-red-100 px-3 py-1 rounded-full">{stats?.status_distribution.closed}</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
