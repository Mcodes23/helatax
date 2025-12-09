import apiClient from "./axiosConfig";

export const filingApi = {
  uploadFile: async (file, month, year) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("month", month);
    formData.append("year", year);

    const response = await apiClient.post("/filing/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getHistory: async () => {
    const response = await apiClient.get("/filing/history");
    return response.data;
  },

  confirmPayment: async (filingId) => {
    const response = await apiClient.put(`/filing/pay/${filingId}`);
    return response.data;
  },
};
