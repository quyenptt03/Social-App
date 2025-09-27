import { instance as axiosClient } from "../axiosClient";

export interface ProfileUpdateData {
  full_name?: string;
  display_name?: string;
  email?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    display_name?: string;
    role: "user" | "admin";
    avatar_initials: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

const API_BASE = "/api/v1/users";

export const profileApi = {
  // Get current user profile
  getCurrentProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosClient.get(`${API_BASE}/me`);
    return response.data;
  },

  // Update profile
  updateProfile: async (data: ProfileUpdateData): Promise<ProfileResponse> => {
    const response = await axiosClient.patch(`${API_BASE}/profile`, data);
    return response.data;
  },

  // Change password
  changePassword: async (
    data: PasswordChangeData
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.patch(
      `${API_BASE}/change-password`,
      data
    );
    return response.data;
  },

  // Deactivate account
  deactivateAccount: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await axiosClient.delete(`${API_BASE}/deactivate`);
    return response.data;
  },
};
