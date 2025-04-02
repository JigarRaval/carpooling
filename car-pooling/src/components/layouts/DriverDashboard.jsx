import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaCar,
  FaMoneyBillWave,
  FaUsers,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";

const DriverDashboard = () => {
  const [stats, setStats] = useState({
    totalRides: 0,
    earnings: 0,
    passengers: 0,
    upcomingRides: 0,
    averageRating: 0,
  });
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const api = axios.create({
          baseURL: "/api",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        const [statsRes, ridesRes, passengersRes] = await Promise.all([
          api.get("/driver/stats"),
          api.get("/driver/rides/recent"),
          api.get("/driver/passengers/count"),
        ]);

        // Safely handle potential undefined values
        const safeStats = {
          totalRides: statsRes.data.stats?.totalRides || 0,
          earnings: statsRes.data.stats?.earnings || 0,
          upcomingRides: statsRes.data.stats?.upcomingRides || 0,
          averageRating: statsRes.data.stats?.averageRating || 0,
          passengers: passengersRes.data?.count || 0,
        };

        setStats(safeStats);
        setRecentRides(ridesRes.data?.rides || []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Driver Dashboard</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={<FaCar className="text-blue-600" />}
              title="Total Rides"
              value={stats.totalRides}
              color="bg-blue-100"
            />
            <StatCard
              icon={<FaMoneyBillWave className="text-green-600" />}
              title="Total Earnings"
              value={`$${(stats.earnings || 0).toFixed(2)}`}
              color="bg-green-100"
            />
            <StatCard
              icon={<FaUsers className="text-purple-600" />}
              title="Passengers"
              value={stats.passengers}
              color="bg-purple-100"
            />
            <StatCard
              icon={<FaCalendarAlt className="text-orange-600" />}
              title="Upcoming Rides"
              value={stats.upcomingRides}
              color="bg-orange-100"
            />
            <StatCard
              icon={<FaStar className="text-yellow-600" />}
              title="Average Rating"
              value={(stats.averageRating || 0).toFixed(1)}
              color="bg-yellow-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Rides</h2>
              <div className="space-y-4">
                {recentRides.length > 0 ? (
                  recentRides.map((ride) => (
                    <div
                      key={ride.id}
                      className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">
                          {ride.from} → {ride.to}
                        </h3>
                        <span className="text-sm text-gray-600">
                          {ride.date}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          {ride.passengers || 1} passenger
                          {ride.passengers !== 1 ? "s" : ""} (
                          {ride.passengerName || "Anonymous"})
                        </span>
                        <span>${(ride.fare || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No recent rides found</p>
                )}
              </div>
              <Link
                to="/driver/my-rides"
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                View all rides →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/driver/offer-ride"
                  className="block bg-blue-600 text-white text-center py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Offer New Ride
                </Link>
                <Link
                  to="/driver/profile"
                  className="block border border-gray-300 text-center py-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Update Profile
                </Link>
                <Link
                  to="/driver/earnings"
                  className="block border border-gray-300 text-center py-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  View Earnings
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className={`${color} p-6 rounded-lg flex items-center`}>
    <div className="mr-4 text-3xl">{icon}</div>
    <div>
      <p className="text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default DriverDashboard;
