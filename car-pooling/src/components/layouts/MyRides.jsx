import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("driverToken");
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/driver/rides", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.rides) {
          setRides(response.data.rides);
        } else {
          setError("No rides found.");
        }
      } catch (err) {
        setError("Failed to load rides. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  if (loading) return <p className="text-center">Loading rides...</p>;
  if (error)
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
        {error.includes("Authentication required") && (
          <button
            onClick={() => navigate("/login")}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Login
          </button>
        )}
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Rides</h1>
      {rides.length === 0 ? (
        <p>No rides available.</p>
      ) : (
        <ul className="space-y-4">
          {rides.map((ride) => (
            <li
              key={ride._id}
              className="p-4 border rounded-lg shadow-md hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/ride/${ride._id}`)}
            >
              <p>
                <strong>From:</strong> {ride.pickupLocation || "N/A"}
              </p>
              <p>
                <strong>To:</strong> {ride.dropoffLocation || "N/A"}
              </p>
              <p>
                <strong>Fare:</strong> {ride.fare ? `$${ride.fare}` : "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {ride.status || "Unknown"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRides;
