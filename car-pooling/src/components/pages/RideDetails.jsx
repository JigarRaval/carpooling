import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaCar, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const RideDetails = () => {
    const { id } = useParams();
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState({ departure: null, arrival: null });

    useEffect(() => {
        const fetchRideDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/ride/${id}`);
                setRide(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch ride details:", error);
                setLoading(false);
            }
        };

        fetchRideDetails();
    }, [id]);

    useEffect(() => {
        if (ride && !map) {
            const newMap = L.map('map').setView([23.0325, 72.525], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(newMap);
            setMap(newMap);

            // Add markers and route if we have coordinates
            if (ride.departureCoords && ride.arrivalCoords) {
                const depCoords = ride.departureCoords.split(',').map(Number);
                const arrCoords = ride.arrivalCoords.split(',').map(Number);

                const depMarker = L.marker(depCoords).addTo(newMap)
                    .bindPopup(`Departure: ${ride.departureLocation}`);

                const arrMarker = L.marker(arrCoords).addTo(newMap)
                    .bindPopup(`Arrival: ${ride.arrivalLocation}`);

                setMarkers({ departure: depMarker, arrival: arrMarker });

                // Draw route
                drawRoute(newMap, depCoords, arrCoords);

                // Fit bounds to show both markers
                newMap.fitBounds([depCoords, arrCoords]);
            }
        }
    }, [ride, map]);

    const drawRoute = async (map, start, end) => {
        try {
            const response = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
            );
            const route = response.data.routes[0].geometry;
            L.geoJSON(route, {
                style: { color: '#3b82f6', weight: 5 }
            }).addTo(map);
        } catch (error) {
            console.error("Failed to draw route:", error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!ride) {
        return <div className="flex justify-center items-center h-screen">Ride not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                    <div className="p-8 md:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-3xl font-bold text-gray-800 mb-6">Ride Details</h1>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <FaMapMarkerAlt className="text-blue-500 mt-1 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Departure</h3>
                                        <p className="text-gray-600">{ride.departureLocation}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FaMapMarkerAlt className="text-red-500 mt-1 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Arrival</h3>
                                        <p className="text-gray-600">{ride.arrivalLocation}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FaCalendarAlt className="text-green-500 mt-1 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Departure Time</h3>
                                        <p className="text-gray-600">
                                            {new Date(ride.departureTime).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FaCar className="text-purple-500 mt-1 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Vehicle</h3>
                                        <p className="text-gray-600">{ride.vehicleModel || 'Not specified'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FaMoneyBillWave className="text-yellow-500 mt-1 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Price</h3>
                                        <p className="text-gray-600">${ride.costPerSeat} per seat</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FaUser className="text-indigo-500 mt-1 mr-3" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700">Available Seats</h3>
                                        <p className="text-gray-600">{ride.availableSeats}</p>
                                    </div>
                                </div>

                                {ride.routeDescription && (
                                    <div className="flex items-start">
                                        <FaInfoCircle className="text-blue-400 mt-1 mr-3" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700">Route Details</h3>
                                            <p className="text-gray-600">{ride.routeDescription}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300">
                                    Book This Ride
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <div className="md:w-1/2 p-4">
                        <div id="map" className="h-full rounded-lg" style={{ minHeight: '400px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};