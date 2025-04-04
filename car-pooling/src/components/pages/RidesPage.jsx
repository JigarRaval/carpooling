import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaClock,
  FaMapMarkerAlt,
  FaCheck,
  FaMoneyBillWave,
  FaRoute,
  FaCalendar,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const RidesPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRides = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) {
        setError("User ID not found. Please log in.");
        setLoading(false);
        toast.error("Please log in to view your rides");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/rides/driver/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.success) {
          console.log(response.data);
          setRides(response.data.data || []);
        } else {
          throw new Error(response.data?.message || "Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching rides:", error);
        setError(
          error.response?.data?.message ||
            "Failed to load rides. Please try again later."
        );
        toast.error(error.response?.data?.message || "Failed to load rides");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "N/A";
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.round(seconds / 60);
    return mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  };

  const formatDistance = (meters) => {
    if (!meters) return "N/A";
    return (meters / 1000).toFixed(1) + " km";
  };

  const formatFare = (amount) => {
    if (amount === undefined || amount === null) return "$0.00";
    return (
      "$" +
      (typeof amount === "number"
        ? amount.toFixed(2)
        : parseFloat(amount).toFixed(2))
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Error Loading Rides
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Rides
          </h1>
          {/* <button
            onClick={() => navigate("/rides/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <FaCar className="mr-2" />
            Create New Ride
          </button> */}
        </div>

        {rides.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaCar className="mx-auto text-gray-400 text-5xl mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Rides Found
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't completed any rides yet. Start by creating a new ride!
            </p>
            <button
              onClick={() => navigate("/rides/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Create Your First Ride
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride) => (
              <div
                key={ride._id || Math.random()}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {ride.pickupLocation.address || "Unknown"} →{" "}
                        {ride.dropoffLocation.address || "Unknown"}
                      </h2>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <FaCalendar className="mr-1" />
                        {formatDate(ride.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ride.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : ride.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : ride.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ride.status || "unknown"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">
                        {ride.pickupLocation?.address ||
                          "Pickup location not specified"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <FaCheck className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">
                        {ride.dropoffLocation?.address ||
                          "Dropoff location not specified"}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                      <div className="flex items-center">
                        <FaClock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{formatDuration(ride.estimatedDuration)}</span>
                      </div>
                      <div className="flex items-center">
                        <FaRoute className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{formatDistance(ride.estimatedDistance)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Fare</p>
                      <p className="font-medium text-gray-900">
                        <FaMoneyBillWave className="inline mr-1" />
                        {formatFare(ride.fare?.total)}
                      </p>
                    </div>
                    {/* <button
                      onClick={() => navigate(`/rides/${ride._id}`)}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
                    >
                      View Details
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
