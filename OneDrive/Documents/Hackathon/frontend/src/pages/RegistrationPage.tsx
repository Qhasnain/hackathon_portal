import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { registrationService } from "@/services/registration.service";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";
import { ClipboardList, Plus } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import RegistrationModal from "@/components/RegistrationModal";

export default function RegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: () => registrationService.getMyRegistrations(),
  });

  if (isLoading) return <PageLoader />;

  const registrations = registrationsData?.items || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Registrations</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            View your hackathon registrations and team details.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register for Hackathon
        </button>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No registrations yet"
          description="You haven't registered for any hackathons."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((reg) => (
                <tr key={reg.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reg.team_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <StatusBadge status={reg.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reg.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
