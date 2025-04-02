import React, { useEffect, useState } from "react";
import axios from "axios";

export const RidesPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) {
        setError("User ID not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/rides/driver/${userId}`);
        setRides(response.data.data);
      } catch (error) {
        console.error("Error fetching rides:", error.message);
        setError("Failed to load rides. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Rides</h1>
        
        {rides.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No rides available. Start by adding a ride!</p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Create New Ride
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride) => (
              <div key={ride._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {ride.departureLocation} → {ride.arrivalLocation}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {new Date(ride.departureTime).toLocaleDateString()} • {new Date(ride.departureTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ride.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      ride.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ride.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">{ride.pickupLocation?.address}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{ride.dropoffLocation?.address}</span>
                    </div>

                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{Math.round(ride.estimatedDuration / 60)} min</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>{(ride.estimatedDistance / 1000).toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Fare</p>
                      <p className="font-medium text-gray-900">${ride.fare?.total?.toFixed(2)}</p>
                    </div>
                    <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors">
                      Details
                    </button>
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