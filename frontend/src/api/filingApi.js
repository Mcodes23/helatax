import apiClient from "./axiosConfig";

export const filingApi = {
  // 1. Upload Raw Sales (Step 1)
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

  // 2. NEW: Upload Template & Confirm Data (Step 3)
  uploadTemplate: async (file, filingId, transactions) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filingId", filingId);
    // We send the confirmed transactions as a JSON string
    formData.append("transactions", JSON.stringify(transactions));

    const response = await apiClient.post("/filing/autofill", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 3. Get History
  getHistory: async () => {
    const response = await apiClient.get("/filing/history");
    return response.data;
  },

  // 4. Confirm Payment
  confirmPayment: async (filingId) => {
    const response = await apiClient.put(`/filing/pay/${filingId}`);
    return response.data;
  },
};
