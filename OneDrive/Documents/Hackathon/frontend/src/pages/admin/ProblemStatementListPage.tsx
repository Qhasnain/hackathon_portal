import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { problemStatementService } from "@/services/problem-statement.service";
import type { ProblemStatement } from "@/services/problem-statement.service";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";

export const ProblemStatementListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminProblemStatements", page, search],
    queryFn: () => problemStatementService.getAll({ page, page_size: 10, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: problemStatementService.delete,
    onSuccess: () => {
      toast.success("Problem statement deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminProblemStatements"] });
    },
    onError: () => toast.error("Failed to delete problem statement"),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? problemStatementService.publish(id) : problemStatementService.unpublish(id),
    onSuccess: () => {
      toast.success("Publish status updated");
      queryClient.invalidateQueries({ queryKey: ["adminProblemStatements"] });
    },
    onError: () => toast.error("Failed to update publish status"),
  });

  const columns: ColumnDef<ProblemStatement>[] = [
    {
      header: "Code",
      accessorKey: "problem_code",
      cell: (item) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700/50">
          {item.problem_code}
        </span>
      ),
    },
    {
      header: "Title",
      accessorKey: "title",
      cell: (item) => <span className="font-medium text-slate-900 dark:text-slate-100">{item.title}</span>,
    },
    {
      header: "Difficulty",
      accessorKey: "difficulty",
      cell: (item) => {
        const difficultyColors: Record<string, string> = {
          EASY: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
          MEDIUM: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
          HARD: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20",
        };
        const colorClass = difficultyColors[item.difficulty] || "bg-slate-50 text-slate-600 ring-slate-500/10";
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorClass}`}>
            {item.difficulty}
          </span>
        );
      },
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (item) => <span className="text-slate-600 dark:text-slate-400">{item.category}</span>,
    },
    {
      header: "Status",
      accessorKey: "is_published",
      cell: (item) => (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
          item.is_published 
            ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20' 
            : 'bg-slate-50 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700/50'
        }`}>
          {item.is_published ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/problem-statements/${item.id}/edit`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this problem statement?")) {
                deleteMutation.mutate(item.id);
              }
            }}
            className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
          >
            Delete
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={() => {
              togglePublishMutation.mutate({ id: item.id, publish: !item.is_published });
            }}
            className={`text-sm font-medium transition-colors ${
              item.is_published 
                ? 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200' 
                : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300'
            }`}
          >
            {item.is_published ? "Unpublish" : "Publish"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Problem Statements</h1>
        <Link
          to="/admin/problem-statements/create"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          Create Problem Statement
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by code, title, or category..."
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {!isLoading && data?.items?.length === 0 ? (
          <EmptyState
            title="No Problem Statements"
            description={search ? "No problem statements found matching your search." : "Get started by creating a new problem statement."}
            action={!search ? (
              <Link
                to="/admin/problem-statements/create"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
              >
                Create Problem Statement
              </Link>
            ) : undefined}
          />
        ) : (
          <DataTable
            data={data?.items || []}
            columns={columns}
            isLoading={isLoading}
          />
        )}
        
        {data && data.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, data.total)}</span> of <span className="font-medium">{data.total}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                    disabled={page === data.total_pages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemStatementListPage;
