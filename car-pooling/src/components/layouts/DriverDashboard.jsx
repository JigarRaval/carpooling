import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCar,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DriverDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: "/api/drivers",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/dashboard");
      setDashboardData(
        data || {
          stats: {
            totalRides: 0,
            completedRides: 0,
            cancelledRides: 0,
            totalEarnings: 0,
          },
          recentRides: [],
          weeklyEarnings: [],
          vehicle: null,
        }
      );
    } catch (error) {
      setError("Failed to load dashboard data");
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error) => {
    if (error.response?.status === 401) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
    } else {
      console.error("Dashboard error:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Dashboard Data</h2>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  const {
    stats = {},
    recentRides = [],
    weeklyEarnings = [],
    vehicle = null,
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Driver Dashboard
          </h1>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <FiRefreshCw className="text-lg" />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FaCar className="text-xl" />}
            title="Total Rides"
            value={stats.totalRides || 0}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={<FaCheckCircle className="text-xl" />}
            title="Completed"
            value={stats.completedRides || 0}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={<FaTimesCircle className="text-xl" />}
            title="Cancelled"
            value={stats.cancelledRides || 0}
            color="bg-red-100 text-red-600"
          />
          <StatCard
            icon={<FaMoneyBillWave className="text-xl" />}
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Earnings Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Weekly Earnings
              </h2>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            <div className="h-64">
              <Bar
                data={{
                  labels: weeklyEarnings.map((item) => item?._id) || [],
                  datasets: [
                    {
                      label: "Daily Earnings",
                      data: weeklyEarnings.map((item) => item?.total) || [],
                      backgroundColor: "rgba(16, 185, 129, 0.7)",
                      borderColor: "rgba(16, 185, 129, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => formatCurrency(context.raw),
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => formatCurrency(value),
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Your Vehicle
            </h2>
            {vehicle ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Make & Model</p>
                  <p className="font-medium">
                    {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="font-medium">{vehicle.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="font-medium capitalize">
                    {vehicle.vehicleType || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/driver/vehicle/edit")}
                  className="w-full mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Update Vehicle
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No vehicle registered</p>
                <button
                  onClick={() => navigate("/driver/vehicle/add")}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add Vehicle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Rides */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Rides
          </h2>
          {recentRides.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passenger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fare
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentRides.map((ride) => (
                    <tr key={ride._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {ride.passenger?.name || "Passenger"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {ride.pickupLocation?.address || "N/A"} →{" "}
                          {ride.dropoffLocation?.address || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ride.createdAt ? formatDate(ride.createdAt) : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            ride.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : ride.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {ride.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(ride.fare?.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No recent rides found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} mr-4`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
    </div>
  </div>
);

export default DriverDashboard;
