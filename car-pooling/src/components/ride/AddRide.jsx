import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaCarSide, FaRoute } from "react-icons/fa";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AddRide = () => {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [mapInstance, setMapInstance] = useState(null);
    const [markers, setMarkers] = useState({ departure: null, arrival: null });
    const navigate = useNavigate();

    // Fix for Leaflet marker icons
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
        });
    }, []);
    // Utility functions for ride calculations
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    // Haversine formula to calculate distance between two coordinates
    const calculateDistance = (coord1, coord2) => {
        const [lng1, lat1] = coord1;
        const [lng2, lat2] = coord2;

        const R = 6371e3; // Earth radius in meters
        const φ1 = toRadians(lat1);
        const φ2 = toRadians(lat2);
        const Δφ = toRadians(lat2 - lat1);
        const Δλ = toRadians(lng2 - lng1);

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c); // Distance in meters
    };

    // Estimated duration based on distance (assuming average speed of 30km/h)
    const calculateDuration = (distance) => {
        const averageSpeed = 8.33; // meters per second (30km/h)
        return Math.round(distance / averageSpeed); // Duration in seconds
    };

    // Simple fare calculation
    const calculateFare = (basePrice, distance) => {
        const baseFare = 5.00; // Minimum fare
        const distanceRate = 0.0015; // $1.50 per km
        return baseFare + (distance * distanceRate / 1000);
    };

    const submitHandler = async (data) => {
        setLoading(true);
        try {
            // Get coordinates first
            const departureCoords = await fetchCoordinates(data.departureLocation, 'departure');
            const arrivalCoords = await fetchCoordinates(data.arrivalLocation, 'arrival');

            if (!departureCoords || !arrivalCoords) {
                throw new Error('Could not geocode locations');
            }

            // Calculate ride metrics
            const distance = calculateDistance(departureCoords, arrivalCoords);
            const duration = calculateDuration(distance);
            const totalFare = calculateFare(data.price || 5, distance);

            const rideData = {
                driverId: localStorage.getItem("id"),
                passengerId: "67e7df1832d3dfd466956796", // Replace with actual passenger ID
                departureLocation: data.departureLocation,
                arrivalLocation: data.arrivalLocation,
                departureCoordinates: departureCoords,
                arrivalCoordinates: arrivalCoords,
                distance,
                duration,
                totalFare: parseFloat(totalFare.toFixed(2)),
                departureTime: data.departureTime,
                paymentMethod: data.paymentMethod || "cash",
                price: data.price || 0,
                availableSeats: data.availableSeats || 1
            };

            // console.log("Submitting ride data:", rideData);

            const response = await axios.post("/api/rides", rideData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Verify response structure before navigation
            if (!response.data.rideId && !response.data.data?._id) {
                throw new Error("Invalid response format - missing ride ID");
            }

            const rideId = response.data.rideId || response.data.data._id;
            console.log("Created ride ID:", rideId);

            if (!rideId) {
                throw new Error("Ride ID not received from server");
            }

            toast.success("Ride created successfully!");
            navigate('/ride-confirmation', { state: rideData });
            // navigate(`/ride/${rideId}`);

        } catch (error) {
            console.error("Ride creation error:", {
                message: error.message,
                response: error.response?.data
            });

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to create ride"
            );
        } finally {
            setLoading(false);
        }
    };

    const addMarker = (location, type) => {
        if (markers[type]) {
            mapInstance.removeLayer(markers[type]);
        }
        const newMarker = L.marker(location).addTo(mapInstance);
        setMarkers((prev) => ({ ...prev, [type]: newMarker }));
    };

    const fetchCoordinates = async (address, type) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: address, format: 'json' }
            });
            if (response.data.length > 0) {
                const { lat, lon } = response.data[0];
                const location = [parseFloat(lat), parseFloat(lon)];
                addMarker(location, type);
                mapInstance.setView(location, 13);
                return location;
            }
            return null;
        } catch (error) {
            toast.error("Location not found");
            return null;
        }
    };

    const displayRoute = async () => {
        if (!markers.departure || !markers.arrival) {
            toast.warn("Please set both departure and arrival locations first");
            return;
        }

        try {
            const depLatLng = markers.departure.getLatLng();
            const arrLatLng = markers.arrival.getLatLng();
            const url = `https://router.project-osrm.org/route/v1/driving/${depLatLng.lng},${depLatLng.lat};${arrLatLng.lng},${arrLatLng.lat}?overview=full&geometries=geojson`;

            const response = await axios.get(url);
            const route = response.data.routes[0].geometry;

            // Clear previous route if exists
            mapInstance.eachLayer(layer => {
                if (layer instanceof L.GeoJSON) {
                    mapInstance.removeLayer(layer);
                }
            });

            L.geoJSON(route, {
                style: { color: '#3b82f6', weight: 4 }
            }).addTo(mapInstance);
        } catch (error) {
            toast.error("Failed to fetch route");
            console.error("Route error:", error);
        }
    };

    useEffect(() => {
        if (!mapInstance) {
            const map = L.map('map').setView([23.0325, 72.525], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            setMapInstance(map);
        }

        return () => {
            if (mapInstance) {
                mapInstance.remove();
            }
        };
    }, [mapInstance]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-12">
            <ToastContainer position="top-right" autoClose={5000} />
            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 bg-white p-8 rounded-xl shadow-lg">
                <motion.form
                    onSubmit={handleSubmit(submitHandler)}
                    className="space-y-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create New Ride</h2>

                    {/* Departure Location */}
                    <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                            {...register("departureLocation", { required: "Departure location is required" })}
                            placeholder="Departure Location"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onBlur={(e) => e.target.value && fetchCoordinates(e.target.value, 'departure')}
                        />
                        {errors.departureLocation && (
                            <p className="text-red-500 text-sm mt-1">{errors.departureLocation.message}</p>
                        )}
                    </div>

                    {/* Arrival Location */}
                    <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                            {...register("arrivalLocation", { required: "Arrival location is required" })}
                            placeholder="Arrival Location"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onBlur={(e) => e.target.value && fetchCoordinates(e.target.value, 'arrival')}
                        />
                        {errors.arrivalLocation && (
                            <p className="text-red-500 text-sm mt-1">{errors.arrivalLocation.message}</p>
                        )}
                    </div>

                    {/* Departure Time */}
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                            {...register("departureTime", { required: "Departure time is required" })}
                            type="datetime-local"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.departureTime && (
                            <p className="text-red-500 text-sm mt-1">{errors.departureTime.message}</p>
                        )}
                    </div>

                    {/* Price */}
                    {/* <div className="relative">
                        <FaDollarSign className="absolute left-3 top-3 text-gray-400" />
                        <input 
                            {...register("price", { 
                                required: "Price is required",
                                min: { value: 0, message: "Price must be positive" }
                            })}
                            type="number"
                            step="0.01"
                            placeholder="Price per seat"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.price && (
                            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                        )}
                    </div> */}

                    {/* Available Seats */}
                    {/* <div className="relative">
                        <FaCarSide className="absolute left-3 top-3 text-gray-400" />
                        <input 
                            {...register("availableSeats", { 
                                required: "Seats number is required",
                                min: { value: 1, message: "At least 1 seat required" }
                            })}
                            type="number"
                            min="1"
                            placeholder="Available seats"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {errors.availableSeats && (
                            <p className="text-red-500 text-sm mt-1">{errors.availableSeats.message}</p>
                        )}
                    </div> */}

                    {/* Route Description */}
                    <div className="relative">
                        <FaRoute className="absolute left-3 top-3 text-gray-400" />
                        <textarea
                            {...register("routeDescription")}
                            placeholder="Additional route details (optional)"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-4">
                        <motion.button
                            type="button"
                            onClick={displayRoute}
                            className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Preview Route
                        </motion.button>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </span>
                            ) : "Create Ride"}
                        </motion.button>
                    </div>
                </motion.form>

                <motion.div
                    id="map-container"
                    className="h-full"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div id="map" className="h-full min-h-[400px] rounded-lg border border-gray-300"></div>
                </motion.div>
            </div>
        </div>
    );
};