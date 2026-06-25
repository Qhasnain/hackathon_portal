import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationService, RegistrationStatus } from "@/services/registration.service";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { ClipboardList, Check, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminRegistrationListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminRegistrations", page, search],
    queryFn: () => registrationService.getAll({ page, search }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RegistrationStatus }) =>
      registrationService.update(id, { status }),
    onSuccess: () => {
      toast.success("Registration status updated");
      queryClient.invalidateQueries({ queryKey: ["adminRegistrations"] });
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleUpdateStatus = (id: string, status: RegistrationStatus) => {
    updateMutation.mutate({ id, status });
  };

  if (isLoading) return <PageLoader />;

  const registrations = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registrations</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage team registrations across all hackathons.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search teams..."
            className="w-full sm:w-64 rounded-xl border border-gray-300 px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No registrations found"
          description={search ? "Try adjusting your search query." : "No teams have registered yet."}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hackathon ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.team_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" title={reg.hackathon_id}>
                      {reg.hackathon_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {reg.status !== RegistrationStatus.APPROVED && (
                          <button
                            onClick={() => handleUpdateStatus(reg.id, RegistrationStatus.APPROVED)}
                            className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {reg.status !== RegistrationStatus.REJECTED && (
                          <button
                            onClick={() => handleUpdateStatus(reg.id, RegistrationStatus.REJECTED)}
                            className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Simple pagination control */}
          {data && (
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Page {data.page} of {data.total_pages} ({data.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={page >= data.total_pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
