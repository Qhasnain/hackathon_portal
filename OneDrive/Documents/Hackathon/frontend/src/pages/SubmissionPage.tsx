import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationService } from "@/services/registration.service";
import { submissionService, SubmissionStatus } from "@/services/submission.service";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { FileUp, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function SubmissionPage() {
  const { data: registrationsData, isLoading: isLoadingRegs } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: () => registrationService.getMyRegistrations(),
  });

  if (isLoadingRegs) return <PageLoader />;

  const registrations = registrationsData?.items || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Submissions</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Manage your hackathon project submissions.
        </p>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          icon={<FileUp className="h-10 w-10" />}
          title="No submissions available"
          description="Register for a hackathon first to submit a project."
        />
      ) : (
        <div className="space-y-6">
          {registrations.map((reg) => (
            <SubmissionCard key={reg.id} registrationId={reg.id} teamName={reg.team_name} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ registrationId, teamName }: { registrationId: string; teamName: string }) {
  const queryClient = useQueryClient();
  const [repoUrl, setRepoUrl] = useState("");
  const [presUrl, setPresUrl] = useState("");

  const { data: submission, isLoading } = useQuery({
    queryKey: ["submission", registrationId],
    queryFn: () => submissionService.getByRegistrationId(registrationId),
  });

  // Initialize form state once data is loaded
  React.useEffect(() => {
    if (submission) {
      setRepoUrl(submission.repository_url || "");
      setPresUrl(submission.presentation_url || "");
    }
  }, [submission]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => submissionService.update(submission!.id, data),
    onSuccess: () => {
      toast.success("Project submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["submission", registrationId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to submit project");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;
    updateMutation.mutate({
      repository_url: repoUrl,
      presentation_url: presUrl,
    });
  };

  if (isLoading) return <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse h-32" />;
  if (!submission) return null;

  const isReadonly = submission.status === SubmissionStatus.SUBMITTED;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team: {teamName}</h3>
          <p className="text-sm text-gray-500 font-mono">Submission ID: {submission.id.slice(0, 8)}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Repository URL (GitHub/GitLab)</label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isReadonly || updateMutation.isPending}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Presentation URL (Video/Slides)</label>
          <input
            type="url"
            value={presUrl}
            onChange={(e) => setPresUrl(e.target.value)}
            disabled={isReadonly || updateMutation.isPending}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="https://youtube.com/..."
          />
        </div>

        {!isReadonly && (
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending || (!repoUrl && !presUrl)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save & Submit Project"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
