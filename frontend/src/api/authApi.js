import apiClient from "./axiosConfig";

export const authApi = {
  // 1. Register User
  // Payload: { name, email, password, profession, businessType, kra_pin }
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  // 2. Login User
  // Payload: { email, password }
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  // 3. Logout (Simple cleanup)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
