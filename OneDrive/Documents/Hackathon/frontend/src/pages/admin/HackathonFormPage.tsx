import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { hackathonService, HackathonStatus, HackathonMode } from "@/services/hackathon.service";
import PageLoader from "@/components/ui/PageLoader";

const hackathonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  registration_start_date: z.string().min(1, "Start date is required"),
  registration_end_date: z.string().min(1, "End date is required"),
  submission_deadline: z.string().min(1, "Submission deadline is required"),
  status: z.nativeEnum(HackathonStatus).optional(),
  mode: z.nativeEnum(HackathonMode),
  location: z.string().min(1, "Location is required"),
  max_teams: z.union([z.string(), z.number()]).nullable().transform((val) => {
    if (val === "" || val === null || val === undefined) return null;
    return Number(val);
  }),
  is_featured: z.boolean(),
}).refine((data) => {
  if (data.registration_start_date && data.registration_end_date) {
    return new Date(data.registration_end_date) > new Date(data.registration_start_date);
  }
  return true;
}, {
  message: "Registration end date must be after start date",
  path: ["registration_end_date"],
}).refine((data) => {
  if (data.registration_end_date && data.submission_deadline) {
    return new Date(data.submission_deadline) > new Date(data.registration_end_date);
  }
  return true;
}, {
  message: "Submission deadline must be after registration end date",
  path: ["submission_deadline"],
});

type HackathonFormData = z.infer<typeof hackathonSchema>;

export const HackathonFormPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const isEditing = Boolean(slug);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: hackathon, isLoading: isLoadingHackathon } = useQuery({
    queryKey: ["hackathon", slug],
    queryFn: () => hackathonService.getBySlug(slug!),
    enabled: isEditing,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      registration_start_date: "",
      registration_end_date: "",
      submission_deadline: "",
      status: HackathonStatus.UPCOMING,
      mode: HackathonMode.OFFLINE,
      location: "LJ University",
      max_teams: null,
      is_featured: false,
    }
  });

  useEffect(() => {
    if (hackathon) {
      reset({
        title: hackathon.title,
        description: hackathon.description,
        registration_start_date: new Date(hackathon.registration_start_date).toISOString().slice(0, 16),
        registration_end_date: new Date(hackathon.registration_end_date).toISOString().slice(0, 16),
        submission_deadline: new Date(hackathon.submission_deadline).toISOString().slice(0, 16),
        status: hackathon.status,
        mode: hackathon.mode,
        location: hackathon.location,
        max_teams: hackathon.max_teams,
        is_featured: hackathon.is_featured,
      });
    }
  }, [hackathon, reset]);

  const createMutation = useMutation({
    mutationFn: hackathonService.create,
    onSuccess: () => {
      toast.success("Hackathon created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminHackathons"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      navigate("/admin/hackathons");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create hackathon");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: HackathonFormData) => hackathonService.update(hackathon!.id, data),
    onSuccess: () => {
      toast.success("Hackathon updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminHackathons"] });
      queryClient.invalidateQueries({ queryKey: ["hackathon", slug] });
      navigate("/admin/hackathons");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update hackathon");
    }
  });

  const onSubmit = (data: HackathonFormData) => {
    const formattedData = {
      ...data,
      max_teams: data.max_teams ? Number(data.max_teams) : null,
      banner_image: null, // Default
      registration_start_date: new Date(data.registration_start_date).toISOString(),
      registration_end_date: new Date(data.registration_end_date).toISOString(),
      submission_deadline: new Date(data.submission_deadline).toISOString(),
    };

    if (isEditing) {
      updateMutation.mutate(formattedData);
    } else {
      createMutation.mutate(formattedData);
    }
  };

  if (isEditing && isLoadingHackathon) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Hackathon" : "Create Hackathon"}
        </h1>
        <button
          onClick={() => navigate("/admin/hackathons")}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                {...register("title")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Start</label>
                <input
                  type="datetime-local"
                  {...register("registration_start_date")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                {errors.registration_start_date && <p className="mt-1 text-sm text-red-600">{errors.registration_start_date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Registration End</label>
                <input
                  type="datetime-local"
                  {...register("registration_end_date")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                {errors.registration_end_date && <p className="mt-1 text-sm text-red-600">{errors.registration_end_date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Submission Deadline</label>
                <input
                  type="datetime-local"
                  {...register("submission_deadline")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                {errors.submission_deadline && <p className="mt-1 text-sm text-red-600">{errors.submission_deadline.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mode</label>
                <select
                  {...register("mode")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                >
                  <option value={HackathonMode.ONLINE}>Online</option>
                  <option value={HackathonMode.OFFLINE}>Offline</option>
                  <option value={HackathonMode.HYBRID}>Hybrid</option>
                </select>
                {errors.mode && <p className="mt-1 text-sm text-red-600">{errors.mode.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  {...register("location")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Teams (Optional)</label>
                <input
                  type="number"
                  {...register("max_teams")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                {errors.max_teams && <p className="mt-1 text-sm text-red-600">{errors.max_teams.message}</p>}
              </div>
            </div>
            
            {isEditing && (
               <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  {...register("status")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                >
                  <option value={HackathonStatus.UPCOMING}>Upcoming</option>
                  <option value={HackathonStatus.REGISTRATION_OPEN}>Registration Open</option>
                  <option value={HackathonStatus.SUBMISSION_OPEN}>Submission Open</option>
                  <option value={HackathonStatus.CLOSED}>Closed</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                {...register("is_featured")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="block text-sm font-medium text-gray-700">
                Featured Hackathon (Show on landing page)
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Hackathon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HackathonFormPage;
