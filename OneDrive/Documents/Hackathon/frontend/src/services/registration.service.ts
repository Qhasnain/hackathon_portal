import apiClient from "./api";
import type { PaginatedResponse } from "./hackathon.service";

export enum RegistrationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Registration {
  id: string;
  hackathon_id: string;
  user_id: string;
  team_name: string;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateRegistrationDTO {
  hackathon_id: string;
  problem_statement_id: string;
  team_name: string;
}

export interface UpdateRegistrationDTO {
  status: RegistrationStatus;
}

export interface RegistrationQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  hackathon_id?: string;
  user_id?: string;
  status?: RegistrationStatus;
}

export const registrationService = {
  // Admin Methods
  getAll: async (params?: RegistrationQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<Registration>>("/registrations", { params });
    return response.data;
  },

  update: async (id: string, data: UpdateRegistrationDTO) => {
    const response = await apiClient.put<Registration>(`/registrations/${id}`, data);
    return response.data;
  },

  // Student Methods
  getMyRegistrations: async (params?: { page?: number; page_size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Registration>>("/registrations/my", { params });
    return response.data;
  },

  create: async (data: CreateRegistrationDTO) => {
    const response = await apiClient.post<Registration>("/registrations", data);
    return response.data;
  },
};
