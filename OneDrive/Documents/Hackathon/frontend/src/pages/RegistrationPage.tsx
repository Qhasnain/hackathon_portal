import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationService } from "@/services/registration.service";
import { hackathonService } from "@/services/hackathon.service";
import { problemStatementService } from "@/services/problem-statement.service";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";
import { ClipboardList, Plus, X } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import toast from "react-hot-toast";

export default function RegistrationPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: () => registrationService.getMyRegistrations(),
  });

  const [selectedHackathon, setSelectedHackathon] = useState("");
  const [selectedProblem, setSelectedProblem] = useState("");
  const [teamName, setTeamName] = useState("");

  const { data: hackathonsData } = useQuery({
    queryKey: ["hackathons", "open_for_registration"],
    queryFn: async () => {
      // Fetch a larger page size to ensure we get active ones
      const response = await hackathonService.getAll({ page_size: 100 });
      // Filter dynamically computed state
      return {
        ...response,
        items: response.items.filter((h) => h.is_registration_open)
      };
    },
    enabled: isModalOpen,
  });

  const { data: problemsData } = useQuery({
    queryKey: ["hackathonProblems", selectedHackathon],
    queryFn: () => {
      const hackathon = hackathonsData?.items.find((h) => h.id === selectedHackathon);
      if (!hackathon) return null;
      return problemStatementService.getForHackathon(hackathon.slug);
    },
    enabled: !!selectedHackathon && isModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: registrationService.create,
    onSuccess: () => {
      toast.success("Successfully registered team!");
      queryClient.invalidateQueries({ queryKey: ["myRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["studentDashboardStats"] });
      setIsModalOpen(false);
      setTeamName("");
      setSelectedHackathon("");
      setSelectedProblem("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to register");
    },
  });

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon || !selectedProblem || !teamName) {
      toast.error("Please fill in all fields");
      return;
    }
    createMutation.mutate({
      hackathon_id: selectedHackathon,
      problem_statement_id: selectedProblem,
      team_name: teamName,
    });
  };

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

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Register Team</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Hackathon</label>
                <select
                  value={selectedHackathon}
                  onChange={(e) => {
                    setSelectedHackathon(e.target.value);
                    setSelectedProblem("");
                  }}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                  required
                >
                  <option value="">-- Choose Hackathon --</option>
                  {hackathonsData?.items.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedHackathon && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Problem Statement</label>
                  <select
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                    required
                  >
                    <option value="">-- Choose Problem --</option>
                    {problemsData?.items.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.problem_code}] {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                  placeholder="Enter your team name"
                  required
                  minLength={3}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !selectedHackathon || !selectedProblem || !teamName}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Registering..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
