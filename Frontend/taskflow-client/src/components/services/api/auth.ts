import api from "./axios";
import { AuthResponse, RegisterData } from "../../types/auth.types";

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/authenticate", {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response.data;
  },

  verifyEmail: async (email: string, code: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/verify", null, {
      params: { email, code },
    });
    return response.data;
  },
};
