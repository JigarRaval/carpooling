import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedDriverId = localStorage.getItem("driverId");

      if (token && storedUser && storedDriverId) {
        try {
          // Verify token with backend if needed
          setUser(JSON.parse(storedUser));
          setDriverId(storedDriverId);
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/drivers/login",
        { email, password }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        })
      );
      localStorage.setItem("driverId", response.data.driverId);

      setUser({
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      });
      setDriverId(response.data.driverId);

      navigate("/driver/dashboard");
    } catch (err) {
      throw err.response?.data?.message || "Login failed";
    }
  };

  const signup = async (formData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/drivers/signup",
        formData
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        })
      );
      localStorage.setItem("driverId", response.data.driverId);

      setUser({
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      });
      setDriverId(response.data.driverId);

      navigate("/driver/dashboard");
    } catch (err) {
      throw err.response?.data?.message || "Registration failed";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("driverId");
    setUser(null);
    setDriverId(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        driverId,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
