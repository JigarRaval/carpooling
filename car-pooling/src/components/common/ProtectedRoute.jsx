import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, role = "driver" }) => {
  const { user, driver, loading, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();

      if (!isAuthenticated) {
        navigate("/driver/login");
      } else if (user?.role !== role) {
        navigate("/");
      } else if (role === "driver" && driver?.status !== "approved") {
        navigate("/driver/pending-approval");
      }
    };

    verifyAuth();
  }, [user, driver, loading, checkAuth, navigate, role]);

  if (loading || !user || (role === "driver" && !driver)) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
