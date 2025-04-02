import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCar, FaUser, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaStar, FaRoute } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const RideConfirmation = () => {
    const [status, setStatus] = useState('searching'); // searching, found, accepted, completed
    const [driver, setDriver] = useState(null);
    const [countdown, setCountdown] = useState(5);
    const [rideDetails, setRideDetails] = useState(null);
    const [map, setMap] = useState(null);
    const [route, setRoute] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Fix for Leaflet marker icons
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
        });
    }, []);

    // Initialize map
    useEffect(() => {
        if (!map && status !== 'searching') {
            const mapInstance = L.map('ride-map').setView([23.0325, 72.525], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance);
            setMap(mapInstance);

            return () => {
                mapInstance.remove();
            };
        }
    }, [status, map]);

    // Simulate driver search and acceptance
    useEffect(() => {
        if (status === 'searching') {
            // Set ride details from location state or API
            if (location.state) {
                setRideDetails(location.state);
            } else {
                // Fetch ride details if not passed in state
                // This would be replaced with actual API call
                setRideDetails({
                    departure: "123 Main St",
                    arrival: "456 Park Ave",
                    distance: "5.2 km",
                    duration: "15 min",
                    fare: "$12.50",
                    departureTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }

            // Simulate searching for driver
            const searchTimer = setTimeout(() => {
                setStatus('found');
                setDriver({
                    id: 'driver123',
                    name: 'John Doe',
                    rating: 4.8,
                    car: 'Toyota Camry',
                    color: 'Black',
                    plate: 'ABC-1234',
                    phone: '+1 (555) 123-4567',
                    eta: '2 min'
                });
            }, 3000);

            return () => clearTimeout(searchTimer);
        }

        if (status === 'found') {
            // Simulate driver accepting the ride
            const acceptTimer = setTimeout(() => {
                setStatus('accepted');
                drawRoute();
            }, countdown * 1000);

            const countdownInterval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);

            return () => {
                clearTimeout(acceptTimer);
                clearInterval(countdownInterval);
            };
        }
    }, [status, countdown, location.state]);

    const drawRoute = async () => {
        if (!map || !rideDetails) return;

        try {
            // In a real app, you would use actual coordinates from your ride details
            const depLatLng = [23.0325, 72.525];
            const arrLatLng = [23.0425, 72.535];

            // Add markers
            L.marker(depLatLng).addTo(map)
                .bindPopup("Pickup Location")
                .openPopup();

            L.marker(arrLatLng).addTo(map)
                .bindPopup("Dropoff Location");

            // Simulate route drawing
            const routeLayer = L.polyline([depLatLng, arrLatLng], {
                color: '#3b82f6',
                weight: 4,
                dashArray: '10, 10'
            }).addTo(map);

            setRoute(routeLayer);
            map.fitBounds([depLatLng, arrLatLng]);
        } catch (error) {
            console.error("Error drawing route:", error);
        }
    };

    const cancelRide = () => {
        setStatus('searching');
        setCountdown(5);
        setDriver(null);
        if (map) {
            map.eachLayer(layer => map.removeLayer(layer));
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
        }
        toast.info('Ride cancelled. Searching for another driver...');
    };

    const completeRide = () => {
        setStatus('completed');
        toast.success('Ride completed successfully!');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <ToastContainer position="top-center" autoClose={3000} />

            {/* Header */}
            <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-800"
                >
                    &larr; Back
                </button>
                <h1 className="text-xl font-bold text-gray-800">Ride Details</h1>
                <div className="w-6"></div> {/* Spacer for alignment */}
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {/* Status Indicator */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${status === 'searching' ? 'bg-yellow-500' :
                                status === 'found' ? 'bg-blue-500' :
                                    'bg-green-500'
                                }`}></div>
                            <span className="font-medium text-gray-700">
                                {status === 'searching' ? 'Searching for driver' :
                                    status === 'found' ? 'Driver found' :
                                        'Driver on the way'}
                            </span>
                        </div>
                        {status === 'found' && (
                            <span className="text-sm text-gray-500">Accepting in {countdown}s</span>
                        )}
                    </div>

                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{
                                width: status === 'searching' ? '30%' :
                                    status === 'found' ? '70%' : '100%'
                            }}
                            transition={{ duration: 0.5 }}
                        ></motion.div>
                    </div>
                </div>

                {/* Map */}
                {status !== 'searching' && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        <div id="ride-map" className="h-64 w-full"></div>
                    </div>
                )}

                {/* Driver Info */}
                <AnimatePresence>
                    {(status === 'found' || status === 'accepted') && driver && (
                        <motion.div
                            className="bg-white rounded-xl shadow-md p-6 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-lg font-bold mb-4 flex items-center">
                                <FaCar className="text-blue-500 mr-2" />
                                Your Driver
                            </h2>
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mr-4 overflow-hidden">
                                    <FaUser className="text-2xl text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{driver.name}</h3>
                                    <div className="flex items-center">
                                        <FaStar className="text-yellow-500 mr-1" />
                                        <span>{driver.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Car Model</p>
                                    <p className="font-medium">{driver.car}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Color</p>
                                    <p className="font-medium">{driver.color}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">License Plate</p>
                                    <p className="font-medium">{driver.plate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">ETA</p>
                                    <p className="font-medium">{driver.eta}</p>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <button
                                    onClick={() => window.location.href = `tel:${driver.phone}`}
                                    className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg flex items-center"
                                >
                                    Call Driver
                                </button>
                                {status === 'found' && (
                                    <button
                                        onClick={cancelRide}
                                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg"
                                    >
                                        Cancel Ride
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ride Details */}
                {rideDetails && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center">
                            <FaRoute className="text-blue-500 mr-2" />
                            Ride Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="text-green-500 mt-1 mr-3" />
                                <div>
                                    <p className="font-medium">Pickup</p>
                                    <p className="text-gray-600">{rideDetails.departure}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="text-red-500 mt-1 mr-3" />
                                <div>
                                    <p className="font-medium">Dropoff</p>
                                    <p className="text-gray-600">{rideDetails.arrival}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FaClock className="text-gray-500 mr-3" />
                                    <div>
                                        <p className="font-medium">Departure Time</p>
                                        <p className="text-gray-600">{rideDetails.departureTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaMoneyBillWave className="text-gray-500 mr-3" />
                                    <div>
                                        <p className="font-medium">Fare</p>
                                        <p className="text-gray-600">{rideDetails.fare}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {status === 'accepted' && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={completeRide}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                >
                                    Complete Ride
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Searching Animation */}
            <AnimatePresence>
                {status === 'searching' && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "easeInOut"
                                }}
                                className="mb-6"
                            >
                                <FaCar className="text-4xl text-blue-500 mx-auto" />
                            </motion.div>
                            <h3 className="text-xl font-bold mb-2">Looking for a driver</h3>
                            <p className="text-gray-600 mb-6">We're finding the best match for your ride</p>
                            <div className="flex justify-center">
                                <button
                                    onClick={cancelRide}
                                    className="bg-red-100 text-red-600 px-6 py-2 rounded-lg"
                                >
                                    Cancel Request
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};