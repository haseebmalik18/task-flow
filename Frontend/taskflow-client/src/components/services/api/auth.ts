import api from "./axios";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/authenticate", { email, password });
    return response.data;
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  verifyEmail: async (email: string, code: string) => {
    const response = await api.post("/auth/verify", null, {
      params: { email, code },
    });
    return response.data;
  },
};
