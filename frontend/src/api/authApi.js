import apiClient from "./axiosConfig";

export const authApi = {
  // 1. Register User
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  // 2. Login User
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  updateMode: async (taxMode) => {
    const response = await apiClient.put("/auth/update-mode", {
      tax_mode: taxMode,
    });
    return response.data;
  },

  // 3. Logout (Simple cleanup)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
