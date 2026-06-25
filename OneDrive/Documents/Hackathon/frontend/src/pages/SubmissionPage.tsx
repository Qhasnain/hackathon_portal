import EmptyState from "@/components/ui/EmptyState";
import { FileUp } from "lucide-react";

export default function SubmissionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Submission</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Submit your project and track submission status.
        </p>
      </div>
      <EmptyState
        icon={<FileUp className="h-10 w-10" />}
        title="No submissions yet"
        description="Project submission uploads will be enabled during active hackathons."
      />
    </div>
  );
}
