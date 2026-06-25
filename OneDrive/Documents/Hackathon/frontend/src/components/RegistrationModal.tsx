import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationService } from "@/services/registration.service";
import { hackathonService } from "@/services/hackathon.service";
import { problemStatementService } from "@/services/problem-statement.service";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHackathonId?: string;
}

export default function RegistrationModal({ isOpen, onClose, initialHackathonId = "" }: RegistrationModalProps) {
  const queryClient = useQueryClient();
  const [selectedHackathon, setSelectedHackathon] = useState(initialHackathonId);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [teamName, setTeamName] = useState("");

  const { data: hackathonsData } = useQuery({
    queryKey: ["hackathons", "open_for_registration"],
    queryFn: async () => {
      const response = await hackathonService.getAll({ page_size: 100 });
      return {
        ...response,
        items: response.items.filter((h) => h.is_registration_open)
      };
    },
    enabled: isOpen,
  });

  const { data: problemsData } = useQuery({
    queryKey: ["hackathonProblems", selectedHackathon],
    queryFn: () => {
      const hackathon = hackathonsData?.items.find((h) => h.id === selectedHackathon);
      if (!hackathon) return null;
      return problemStatementService.getForHackathon(hackathon.slug);
    },
    enabled: !!selectedHackathon && isOpen,
  });

  const createMutation = useMutation({
    mutationFn: registrationService.create,
    onSuccess: () => {
      toast.success("Successfully registered team!");
      queryClient.invalidateQueries({ queryKey: ["myRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["studentDashboardStats"] });
      onClose();
      setTeamName("");
      setSelectedHackathon(initialHackathonId);
      setSelectedProblem("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.response?.data?.detail || "Failed to register");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Register Team</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
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
              onClick={onClose}
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
  );
}
