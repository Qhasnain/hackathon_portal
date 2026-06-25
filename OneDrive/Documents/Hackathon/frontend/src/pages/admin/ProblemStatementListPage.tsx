import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { problemStatementService } from "@/services/problem-statement.service";
import type { ProblemStatement } from "@/services/problem-statement.service";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";

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
      cell: (item) => <span className="font-mono text-sm">{item.problem_code}</span>,
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Difficulty",
      accessorKey: "difficulty",
      cell: (item) => {
        const difficultyColors: Record<string, string> = {
          EASY: "bg-green-100 text-green-800",
          MEDIUM: "bg-yellow-100 text-yellow-800",
          HARD: "bg-red-100 text-red-800",
        };
        const colorClass = difficultyColors[item.difficulty] || "bg-gray-100 text-gray-800";
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
            {item.difficulty}
          </span>
        );
      },
    },
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Status",
      accessorKey: "is_published",
      cell: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_published ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
          {item.is_published ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (item) => (
        <div className="flex space-x-3 text-sm">
          <Link
            to={`/admin/problem-statements/${item.id}/edit`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Edit
          </Link>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this problem statement?")) {
                deleteMutation.mutate(item.id);
              }
            }}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
          <button
            onClick={() => {
              togglePublishMutation.mutate({ id: item.id, publish: !item.is_published });
            }}
            className={`${item.is_published ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}`}
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

        <DataTable
          data={data?.items || []}
          columns={columns}
          isLoading={isLoading}
        />
        
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
