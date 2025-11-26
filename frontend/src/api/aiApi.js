import apiClient from "./axiosConfig";

export const aiApi = {
  askQuestion: async (question) => {
    try {
      const response = await apiClient.post("/ai/chat", { question });
      return response.data;
    } catch (error) {
      // Example: provide meaningful message
      throw new Error(error.response?.data?.message || "AI request failed");
    }
  },
};
