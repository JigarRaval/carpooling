import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaCar,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaHistory,
  FaWallet,
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaCog,
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
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRides: 0,
      completedRides: 0,
      cancelledRides: 0,
      totalEarnings: 0,
    },
    recentRides: [],
    weeklyEarnings: [],
    vehicle: null,
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [rides, setRides] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ridePage, setRidePage] = useState(1);
  const [earningsPage, setEarningsPage] = useState(1);
  const navigate = useNavigate();

  // Create axios instance with auth token
  const api = axios.create({
    baseURL: "/api/drivers",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    fetchDashboardData();
    fetchVehicle();
  }, []);

  useEffect(() => {
    if (activeTab === "rides") {
      fetchRides();
    } else if (activeTab === "earnings") {
      fetchEarnings();
    }
  }, [activeTab, ridePage, earningsPage]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/dashboard");
      setDashboardData(data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error("Failed to load dashboard data");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRides = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/rides?page=${ridePage}`);
      setRides(data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error("Failed to load rides");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/earnings?page=${earningsPage}`);
      setEarnings(data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error("Failed to load earnings");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicle = async () => {
    try {
      const { data } = await api.get("/vehicle");
      setVehicle(data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        console.error("Failed to load vehicle info");
      }
    }
  };

  const refreshData = () => {
    fetchDashboardData();
    if (activeTab === "rides") fetchRides();
    if (activeTab === "earnings") fetchEarnings();
    fetchVehicle();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const earningsChartData = {
    labels: dashboardData?.weeklyEarnings?.map((item) => item._id) || [],
    datasets: [
      {
        label: "Daily Earnings",
        data: dashboardData?.weeklyEarnings?.map((item) => item.total) || [],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  const earningsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return formatCurrency(context.raw);
          },
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
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Initialize with default values if data is not loaded yet
  const stats = dashboardData?.stats || {
    totalRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    totalEarnings: 0,
  };

  const recentRides = dashboardData?.recentRides || [];
  const weeklyEarnings = dashboardData?.weeklyEarnings || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
          <button
            onClick={refreshData}
            className="flex items-center text-teal-600 hover:text-teal-800"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "dashboard"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaChartLine className="inline mr-2" />
            Dashboard
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "rides"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("rides")}
          >
            <FaHistory className="inline mr-2" />
            Ride History
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "earnings"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("earnings")}
          >
            <FaWallet className="inline mr-2" />
            Earnings
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "vehicle"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("vehicle")}
          >
            <FaCar className="inline mr-2" />
            My Vehicle
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards - Updated to use the safe stats object */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
                  <FaCar className="text-xl" />
                </div>
                <div>
                  <p className="text-gray-500">Total Rides</p>
                  <h3 className="text-2xl font-bold">{stats.totalRides}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <FaCheckCircle className="text-xl" />
                </div>
                <div>
                  <p className="text-gray-500">Completed Rides</p>
                  <h3 className="text-2xl font-bold">{stats.completedRides}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                  <FaTimesCircle className="text-xl" />
                </div>
                <div>
                  <p className="text-gray-500">Cancelled Rides</p>
                  <h3 className="text-2xl font-bold">{stats.cancelledRides}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FaMoneyBillWave className="text-xl" />
                </div>
                <div>
                  <p className="text-gray-500">Total Earnings</p>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(stats.totalEarnings)}
                  </h3>
                </div>
              </div>
            </div>

            {/* Weekly Earnings Chart */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Weekly Earnings</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: weeklyEarnings.map((item) => item._id) || [],
                    datasets: [
                      {
                        label: "Daily Earnings",
                        data: weeklyEarnings.map((item) => item.total) || [],
                        backgroundColor: "rgba(16, 185, 129, 0.7)",
                        borderColor: "rgba(16, 185, 129, 1)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={earningsChartOptions}
                />
              </div>
            </div>

            {/* Recent Rides */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Recent Rides</h3>
              {recentRides.length > 0 ? (
                <div className="space-y-4">
                  {recentRides.map((ride) => (
                    <div
                      key={ride._id}
                      className="border-b border-gray-100 pb-4 last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            <FaUser className="inline mr-2 text-gray-400" />
                            {ride.passenger?.name || "Passenger"}
                          </p>
                          <p className="text-sm text-gray-500 ml-6">
                            <FaMapMarkerAlt className="inline mr-1" />
                            {ride.pickupLocation.address} →{" "}
                            {ride.dropoffLocation.address}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            ride.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : ride.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {ride.status}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-gray-500">
                        <span>
                          <FaClock className="inline mr-1" />
                          {formatDate(ride.createdAt)}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(ride.fare.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent rides</p>
              )}
            </div>
          </div>
        )}

        {/* Rides Tab */}
        {activeTab === "rides" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ride History</h3>
              {rides.rides?.length > 0 ? (
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
                      {rides.rides.map((ride) => (
                        <tr key={ride._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaUser className="text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {ride.passenger?.name || "Passenger"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {ride.passenger?.phoneNumber || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {ride.pickupLocation.address} →{" "}
                              {ride.dropoffLocation.address}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(ride.createdAt)}
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
                              {ride.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {formatCurrency(ride.fare.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No rides found</p>
              )}
              {rides.total > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing page {ridePage} of {rides.pages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setRidePage((p) => Math.max(1, p - 1))}
                      disabled={ridePage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setRidePage((p) => Math.min(rides.pages, p + 1))
                      }
                      disabled={ridePage === rides.pages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Earnings</h3>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">
                  Total Earnings: {formatCurrency(earnings.totalEarnings || 0)}
                </h4>
              </div>
              {earnings.earnings?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ride
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {earnings.earnings.map((earning) => (
                        <tr key={earning._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(earning.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {earning.rideId ? (
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {earning.rideId.pickupLocation.address} →{" "}
                                {earning.rideId.dropoffLocation.address}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {formatCurrency(earning.netEarnings)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {earning.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                earning.paymentStatus === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : earning.paymentStatus === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {earning.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No earnings found</p>
              )}
              {earnings.total > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing page {earningsPage} of {earnings.pages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEarningsPage((p) => Math.max(1, p - 1))}
                      disabled={earningsPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setEarningsPage((p) => Math.min(earnings.pages, p + 1))
                      }
                      disabled={earningsPage === earnings.pages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicle Tab */}
        {activeTab === "vehicle" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">My Vehicle</h3>
              {vehicle ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">
                      Vehicle Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500">
                          Make
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {vehicle.make}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">
                          Model
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {vehicle.model}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">
                          Year
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {vehicle.year}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">
                          Color
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {vehicle.color}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">
                          License Plate
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {vehicle.licensePlate}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">
                          Vehicle Type
                        </label>
                        <p className="mt-1 text-sm font-medium capitalize">
                          {vehicle.vehicleType}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">
                      Documents
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500">
                          Registration Number
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {vehicle.registration?.number || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">
                          Registration Expiry
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {vehicle.registration?.expiry
                            ? new Date(
                                vehicle.registration.expiry
                              ).toLocaleDateString()
                            : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">
                          Insurance Provider
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {vehicle.insurance?.provider || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">
                          Insurance Expiry
                        </label>
                        <p className="mt-1 text-sm font-medium">
                          {vehicle.insurance?.expiry
                            ? new Date(
                                vehicle.insurance.expiry
                              ).toLocaleDateString()
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/driver/vehicle/edit")}
                      className="mt-6 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                    >
                      <FaCog className="inline mr-2" />
                      Update Vehicle Info
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No vehicle information found
                  </p>
                  <button
                    onClick={() => navigate("/driver/vehicle/add")}
                    className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                  >
                    <FaCar className="inline mr-2" />
                    Add Vehicle Information
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
