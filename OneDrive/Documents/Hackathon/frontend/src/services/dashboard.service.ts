import apiClient from "@/services/api";

export interface DashboardStats {
  total_hackathons: number;
  total_teams: number;
  total_registrations: number;
  total_submissions: number;
  status_distribution: {
    upcoming: number;
    registration_open: number;
    submission_open: number;
    closed: number;
  };
}

export interface StudentStats {
  my_registrations: number;
  my_submissions: number;
  active_hackathons: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<{ data: DashboardStats }>("/dashboard/stats");
    return response.data.data;
  },
  async getStudentStats(): Promise<StudentStats> {
    const response = await apiClient.get<{ data: StudentStats }>("/dashboard/student-stats");
    return response.data.data;
  }
};
