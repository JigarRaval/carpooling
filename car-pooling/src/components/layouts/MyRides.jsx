import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaCar,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { RiRidingFill } from "react-icons/ri";

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("token");

        // Check if token exists
        if (!token) {
          setError("Please login to view rides");
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/drivers/rides", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setRides(res.data.rides);
      } catch (err) {
        console.error("Failed to fetch rides:", err);

        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          // Optionally redirect to login
          // navigate('/login');
        } else {
          setError(err.response?.data?.message || "Failed to load rides");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "accepted":
      case "arrived":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterRides = () => {
    let filtered = [...rides];

    // Apply status filter
    if (filter !== "all") {
      if (filter === "upcoming") {
        filtered = filtered.filter((ride) =>
          ["pending", "accepted", "arrived"].includes(ride.status.toLowerCase())
        );
      } else {
        filtered = filtered.filter(
          (ride) => ride.status.toLowerCase() === filter.toLowerCase()
        );
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ride) =>
          ride.origin.toLowerCase().includes(query) ||
          ride.destination.toLowerCase().includes(query) ||
          ride.passenger?.name?.toLowerCase().includes(query) ||
          ride.fare?.toString().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        return filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return filtered.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "highestFare":
        return filtered.sort((a, b) => (b.fare || 0) - (a.fare || 0));
      case "lowestFare":
        return filtered.sort((a, b) => (a.fare || 0) - (b.fare || 0));
      default:
        return filtered;
    }
  };

  const handleCancelRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/rides/${rideId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update the local state to reflect the cancellation
      setRides(
        rides.map((ride) =>
          ride.id === rideId ? { ...ride, status: "cancelled" } : ride
        )
      );
    } catch (err) {
      console.error("Failed to cancel ride:", err);
      setError(err.response?.data?.message || "Failed to cancel ride");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The filtering is handled in the filterRides function
  };

  const filteredRides = filterRides();

  return (
    <div className="container mt-20 mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Rides</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search rides..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </form>

          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              className="border rounded-md px-3 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highestFare">Highest Fare</option>
              <option value="lowestFare">Lowest Fare</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === "upcoming" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter("in-progress")}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === "in-progress" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === "completed" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 rounded-md text-sm ${
            filter === "cancelled" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Cancelled
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredRides.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <RiRidingFill className="mx-auto text-5xl text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No rides found</h3>
          <p className="text-gray-600 mb-4">
            {filter === "all"
              ? "You haven't taken any rides yet."
              : `You don't have any ${filter.replace("-", " ")} rides.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRides.map((ride) => (
            <div
              key={ride.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-blue-500"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" />
                      {ride.from} → {ride.to}
                    </h2>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        ride.status
                      )}`}
                    >
                      {ride.status}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    ${ride.fare.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="mr-2" />
                    <span>
                      {ride.date ||
                        new Date(ride.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaUser className="mr-2" />
                    <span>
                      {ride.passengers} passenger
                      {ride.passengers !== 1 ? "s" : ""}
                      {ride.passengerName && ` (${ride.passengerName})`}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Link
                    to={`/driver/ride-details/${ride.id}`}
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    View Details
                  </Link>
                  {["pending", "accepted", "arrived"].includes(
                    ride.status.toLowerCase()
                  ) && (
                    <button
                      onClick={() => handleCancelRide(ride.id)}
                      className="text-red-600 hover:underline"
                    >
                      Cancel Ride
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRides;
