import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCar,
  FaMapMarkerAlt,
  FaClock,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationCircle,
} from "react-icons/fa";
import { format, parseISO } from "date-fns";
import defaultAvatar from "../../assets/logo.png";

const MyRides = () => {
  const [data, setData] = useState({
    rides: [],
    pagination: {
      page: 1,
      pages: 1,
      limit: 10,
      total: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
  });
  const navigate = useNavigate();

  // For testing - set to false when using real authentication
  const TEST_MODE = true;
  const TEST_DRIVER_ID = "67ee0fc5821029ebe6842802"; // Replace with actual test driver ID

  const fetchRides = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      let response;

      if (TEST_MODE) {
        // Bypass authentication for testing
        response = await axios.get(
          "http://localhost:3000/api/drivers/my-rides",
          {
            params: {
              page,
              limit: 10,
              status: filters.status || undefined,
              driverId: TEST_DRIVER_ID,
            },
          }
        );
      } else {
        // Normal authenticated request
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        response = await axios.get(
          "http://localhost:3000/api/drivers/my-rides",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            params: {
              page,
              limit: 10,
              status: filters.status || undefined,
            },
          }
        );
      }

      if (response.data?.success) {
        setData({
          rides: response.data.data.rides,
          pagination: response.data.data.pagination,
        });
      } else {
        throw new Error(response.data?.message || "Failed to load rides");
      }
    } catch (err) {
      console.error("Fetch rides error:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load rides";
      setError(errorMsg);

      if (!TEST_MODE && err.response?.status === 401) {
        handleSessionExpiry();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSessionExpiry = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.error("Your session has expired. Please login again.");
    navigate("/login");
  };

  useEffect(() => {
    fetchRides(data.pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.pagination.page, filters.status]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setData((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && data.rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
        <p className="text-gray-600">Loading your ride history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Error loading rides
              </h3>
              <p className="text-red-700">{error}</p>
              <div className="mt-4 flex gap-3">
                {error.includes("Authentication") ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Go to Login
                  </button>
                ) : (
                  <button
                    onClick={() => fetchRides(1)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FaCar className="text-blue-500" />
          <span>My Ride History</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-4 py-2 border rounded-md bg-white shadow-sm"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {data.rides.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">
            No rides found matching your criteria
          </p>
          <button
            onClick={() => {
              setFilters({ status: "" });
              fetchRides(1);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {data.rides.map((ride) => (
              <div
                key={ride._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer border border-gray-100"
                onClick={() => navigate(`/rides/${ride._id}`)}
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={ride.passenger?.profilePhoto || defaultAvatar}
                        alt={ride.passenger?.name || "Passenger"}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = defaultAvatar;
                        }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {ride.passenger?.name || "Unknown Passenger"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span>
                            {ride.pickupLocation?.address || "N/A"} →{" "}
                            {ride.dropoffLocation?.address || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <FaClock className="text-gray-400" />
                          {formatDate(ride.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                          ride.status
                        )}`}
                      >
                        {ride.status?.replace("-", " ") || "unknown"}
                      </span>
                      <p className="text-lg font-bold">
                        {formatCurrency(ride.fare?.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <button
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    pagination: {
                      ...prev.pagination,
                      page: prev.pagination.page - 1,
                    },
                  }))
                }
                disabled={data.pagination.page === 1}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="text-sm" />
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {data.pagination.page} of {data.pagination.pages}
              </span>
              <button
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    pagination: {
                      ...prev.pagination,
                      page: prev.pagination.page + 1,
                    },
                  }))
                }
                disabled={data.pagination.page === data.pagination.pages}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyRides;
