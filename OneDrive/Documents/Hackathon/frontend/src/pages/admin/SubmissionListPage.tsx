import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionService, SubmissionStatus } from "@/services/submission.service";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { FileUp, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSubmissionListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ["adminSubmissions", page],
    queryFn: () => submissionService.getAll({ page }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SubmissionStatus }) =>
      submissionService.adminUpdate(id, { status }),
    onSuccess: () => {
      toast.success("Submission status updated");
      queryClient.invalidateQueries({ queryKey: ["adminSubmissions"] });
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  if (isLoading) return <PageLoader />;

  const submissions = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Submissions</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review and manage hackathon project submissions.
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={<FileUp className="h-10 w-10" />}
          title="No submissions found"
          description="Teams haven't submitted any projects yet."
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" title={sub.registration_id}>
                      {sub.registration_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col space-y-1">
                        {sub.repository_url ? (
                          <a href={sub.repository_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> Repo
                          </a>
                        ) : <span className="text-gray-400">No Repo</span>}
                        {sub.presentation_url && (
                          <a href={sub.presentation_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> Presentation
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sub.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        value={sub.status}
                        onChange={(e) => updateMutation.mutate({ id: sub.id, status: e.target.value as SubmissionStatus })}
                        className="text-sm rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value={SubmissionStatus.DRAFT}>Draft</option>
                        <option value={SubmissionStatus.SUBMITTED}>Submitted</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
