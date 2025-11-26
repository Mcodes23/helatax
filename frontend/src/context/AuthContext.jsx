import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is already logged in when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Login Action
  const login = async (credentials) => {
    const response = await authApi.login(credentials);

    // The backend returns: { success: true, data: { token, ...user } }
    if (response.success) {
      const userData = response.data;

      // Save to State
      setUser(userData);

      // Save to Storage (for refresh)
      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    }
    throw new Error(response.message);
  };

  // 3. Register Action
  const register = async (formData) => {
    const response = await authApi.register(formData);
    return response;
  };

  // 4. Logout Action
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Optional: Redirect to login is handled by the UI, not here
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use this context easily
export const useAuth = () => {
  return useContext(AuthContext);
};
