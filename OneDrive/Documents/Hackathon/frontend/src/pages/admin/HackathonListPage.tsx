import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { hackathonService } from "@/services/hackathon.service";
import type { Hackathon } from "@/services/hackathon.service";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";

export const HackathonListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adminHackathons", page],
    queryFn: () => hackathonService.getAll({ page, page_size: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: hackathonService.delete,
    onSuccess: () => {
      toast.success("Hackathon deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminHackathons"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      setDeleteModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete hackathon");
      setDeleteModalOpen(false);
    }
  });

  const handleDeleteClick = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedHackathon) {
      deleteMutation.mutate(selectedHackathon.id);
    }
  };

  const columns: ColumnDef<Hackathon>[] = [
    {
      header: "Title",
      cell: (item) => (
        <div className="font-medium text-gray-900">{item.title}</div>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Registration Start",
      cell: (item) => new Date(item.registration_start_date).toLocaleDateString(),
    },
    {
      header: "Deadline",
      cell: (item) => new Date(item.submission_deadline).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex space-x-3">
          <Link
            to={`/admin/hackathons/${item.slug}/edit`}
            className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDeleteClick(item)}
            className="text-red-600 hover:text-red-900 font-medium text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hackathons</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your institution's hackathons</p>
        </div>
        <Link
          to="/admin/hackathons/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Hackathon
        </Link>
      </div>

      <DataTable data={data?.items || []} columns={columns} isLoading={isLoading} />

      {data && data.total_pages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {data.total_pages}</span>
          <button
            onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
            disabled={page === data.total_pages}
            className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {deleteModalOpen && selectedHackathon && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Hackathon
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <span className="font-semibold">{selectedHackathon.title}</span>? All of its data will be permanently removed. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonListPage;
