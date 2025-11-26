import axios from "axios";

// 1. Create a standard "Client" that points to your backend
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api/v1", // The address of your Node.js server
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. The "Interceptor" (Automatic Token Adder)
// This checks if you have a saved token and attaches it to every request automatically.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Look in browser storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach the VIP pass
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
