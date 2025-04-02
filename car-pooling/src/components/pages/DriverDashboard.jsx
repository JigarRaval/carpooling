import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DriverPage = () => {
    const navigate = useNavigate();
    
    // Driver state
    const [driverStatus, setDriverStatus] = useState('offline');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [rideRequests, setRideRequests] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [earnings, setEarnings] = useState({
        today: 0,
        weekly: 0,
        monthly: 0
    });
    const [driverProfile, setDriverProfile] = useState({
        rating: 4.8,
        totalRides: 0,
        vehicleInfo: {
            make: '',
            model: '',
            year: '',
            licensePlate: '',
            color: ''
        }
    });
    const [navigationMode, setNavigationMode] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vehicleFormData, setVehicleFormData] = useState({
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        color: ''
    });

    // Fetch driver profile and initial data
    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                setIsLoading(true);
                // Fetch driver profile
                const profileResponse = await axios.get('/api/driver/profile');
                setDriverProfile(profileResponse.data);
                
                // Fetch earnings
                const earningsResponse = await axios.get('/api/driver/earnings');
                setEarnings(earningsResponse.data);
                
                // Check for active ride
                const activeRideResponse = await axios.get('/api/driver/active-ride');
                if (activeRideResponse.data) {
                    setActiveRide(activeRideResponse.data);
                    setNavigationMode('navigation');
                }
                
                // Initialize vehicle form data
                setVehicleFormData(profileResponse.data.vehicleInfo);
                
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load driver data');
                console.error("Error fetching driver data:", err);
                setIsLoading(false);
            }
        };

        fetchDriverData();
    }, []);

    // Get current location and update it periodically
    useEffect(() => {
        const updateLocation = () => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(newLocation);
                    
                    // Update server with new location if online
                    if (driverStatus === 'online') {
                        try {
                            await axios.post('/api/driver/location', {
                                latitude: newLocation.lat,
                                longitude: newLocation.lng
                            });
                        } catch (err) {
                            console.error("Error updating location:", err);
                        }
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Default to San Francisco if location access is denied
                    setCurrentLocation({ lat: 37.7749, lng: -122.4194 });
                }
            );
        };

        updateLocation();
        const locationInterval = setInterval(updateLocation, 30000); // Update every 30 seconds

        return () => clearInterval(locationInterval);
    }, [driverStatus]);

    // Poll for ride requests when online
    useEffect(() => {
        let requestInterval;
        
        const fetchRideRequests = async () => {
            if (driverStatus === 'online' && !activeRide) {
                try {
                    const response = await axios.get('/api/driver/ride-requests');
                    setRideRequests(response.data);
                } catch (err) {
                    console.error("Error fetching ride requests:", err);
                }
            }
        };

        if (driverStatus === 'online') {
            fetchRideRequests();
            requestInterval = setInterval(fetchRideRequests, 10000); // Poll every 10 seconds
        }

        return () => clearInterval(requestInterval);
    }, [driverStatus, activeRide]);

    // Toggle driver availability
    const toggleStatus = async () => {
        try {
            const newStatus = driverStatus === 'offline' ? 'online' : 'offline';
            await axios.post('/api/driver/status', { status: newStatus });
            setDriverStatus(newStatus);
            
            if (newStatus === 'offline') {
                setRideRequests([]);
                setActiveRide(null);
                setNavigationMode('overview');
            }
        } catch (err) {
            console.error("Error updating driver status:", err);
            setError('Failed to update status');
        }
    };

    // Accept a ride request
    const acceptRide = async (rideId) => {
        try {
            const response = await axios.post('/api/driver/accept-ride', { rideId });
            setActiveRide(response.data);
            setRideRequests([]);
            setNavigationMode('navigation');
        } catch (err) {
            console.error("Error accepting ride:", err);
            setError('Failed to accept ride');
        }
    };

    // Complete the current ride
    const completeRide = async () => {
        try {
            await axios.post('/api/driver/complete-ride', { rideId: activeRide.id });
            
            // Update earnings locally (better to fetch fresh data from server)
            const fareAmount = parseFloat(activeRide.fare.replace('$', ''));
            setEarnings(prev => ({
                ...prev,
                today: prev.today + fareAmount,
                weekly: prev.weekly + fareAmount,
                monthly: prev.monthly + fareAmount
            }));

            // Update driver profile stats
            setDriverProfile(prev => ({
                ...prev,
                totalRides: prev.totalRides + 1
            }));

            setActiveRide(null);
            setNavigationMode('overview');
        } catch (err) {
            console.error("Error completing ride:", err);
            setError('Failed to complete ride');
        }
    };

    // Cancel the current ride
    const cancelRide = async () => {
        try {
            await axios.post('/api/driver/cancel-ride', { rideId: activeRide.id });
            setActiveRide(null);
            setNavigationMode('overview');
        } catch (err) {
            console.error("Error canceling ride:", err);
            setError('Failed to cancel ride');
        }
    };

    // Handle vehicle info update
    const handleVehicleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/api/driver/vehicle', vehicleFormData);
            setDriverProfile(prev => ({
                ...prev,
                vehicleInfo: response.data
            }));
            setShowVehicleModal(false);
        } catch (err) {
            console.error("Error updating vehicle info:", err);
            setError('Failed to update vehicle info');
        }
    };

    const handleVehicleChange = (e) => {
        const { name, value } = e.target;
        setVehicleFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl font-semibold">Loading driver dashboard...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header Section */}
            <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold">DriveWithUs</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${driverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {driverStatus.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <button
                        className={`px-4 py-2 rounded font-bold ${driverStatus === 'online'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white transition-colors`}
                        onClick={toggleStatus}
                    >
                        Go {driverStatus === 'offline' ? 'Online' : 'Offline'}
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-1 overflow-hidden">
                {/* Left Panel - Map */}
                <div className="flex-1 p-4 bg-gray-200 overflow-y-auto">
                    {currentLocation ? (
                        <div className="h-full bg-gray-300 rounded-lg p-4 flex flex-col">
                            <h3 className="text-lg font-semibold mb-2">Map View ({navigationMode})</h3>
                            <p className="text-gray-700 mb-4">
                                Current Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                            </p>
                            
                            {/* Map Visualization Placeholder */}
                            <div className="flex-1 bg-blue-50 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-gray-600 mb-2">Map visualization would appear here</p>
                                    <p className="text-sm text-gray-500">Integrate with Google Maps or Mapbox API</p>
                                </div>
                            </div>
                            
                            {activeRide && (
                                <div className="bg-white p-4 rounded-lg shadow mt-4">
                                    <h4 className="font-semibold text-lg mb-2">
                                        {navigationMode === 'navigation' 
                                            ? `Navigating to ${activeRide.pickupLocation}`
                                            : `Taking ${activeRide.passengerName} to ${activeRide.dropoffLocation}`}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <p className="text-gray-600 text-sm">Passenger</p>
                                            <p className="font-medium">{activeRide.passengerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">Passenger Rating</p>
                                            <p className="font-medium">{activeRide.passengerRating}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">Pickup</p>
                                            <p className="font-medium">{activeRide.pickupLocation}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">Dropoff</p>
                                            <p className="font-medium">{activeRide.dropoffLocation}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div>
                                            <p className="text-gray-600 text-sm">Fare</p>
                                            <p className="font-bold text-lg">{activeRide.fare}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-medium transition-colors"
                                                onClick={completeRide}
                                            >
                                                Complete Ride
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-medium transition-colors"
                                                onClick={cancelRide}
                                            >
                                                Cancel Ride
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>Loading map...</p>
                    )}
                </div>

                {/* Right Panel - Information */}
                <div className="w-96 p-4 bg-white overflow-y-auto border-l border-gray-300">
                    {/* Ride Requests */}
                    {driverStatus === 'online' && !activeRide && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold">Ride Requests</h3>
                                <span className="text-sm text-gray-500">{rideRequests.length} available</span>
                            </div>
                            {rideRequests.length > 0 ? (
                                <div className="space-y-3">
                                    {rideRequests.map(ride => (
                                        <div key={ride.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold">{ride.passengerName}</p>
                                                    <p className="text-sm text-gray-600">Rating: {ride.passengerRating}</p>
                                                </div>
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                    {ride.distance} away
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-500">From</p>
                                                    <p className="text-sm font-medium">{ride.pickupLocation}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">To</p>
                                                    <p className="text-sm font-medium">{ride.dropoffLocation}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold">{ride.fare}</p>
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors"
                                                    onClick={() => acceptRide(ride.id)}
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-gray-500">Waiting for ride requests...</p>
                                    <p className="text-xs text-gray-400 mt-1">You'll be notified when a ride is available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Earnings Summary */}
                    <div className="mb-6 bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3">Earnings</h3>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-white p-2 rounded text-center border border-gray-200">
                                <span className="block text-xs text-gray-600">Today</span>
                                <span className="block text-lg font-bold">${earnings.today.toFixed(2)}</span>
                            </div>
                            <div className="bg-white p-2 rounded text-center border border-gray-200">
                                <span className="block text-xs text-gray-600">This Week</span>
                                <span className="block text-lg font-bold">${earnings.weekly.toFixed(2)}</span>
                            </div>
                            <div className="bg-white p-2 rounded text-center border border-gray-200">
                                <span className="block text-xs text-gray-600">This Month</span>
                                <span className="block text-lg font-bold">${earnings.monthly.toFixed(2)}</span>
                            </div>
                        </div>
                        <button 
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded text-sm font-medium transition-colors"
                            onClick={() => navigate('/driver/earnings')}
                        >
                            View Earnings Details
                        </button>
                    </div>

                    {/* Driver Rating */}
                    <div className="mb-6 bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3">Your Rating</h3>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl font-bold">{driverProfile.rating}</span>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-xl ${i < Math.floor(driverProfile.rating)
                                            ? 'text-yellow-500'
                                            : i === Math.floor(driverProfile.rating) && driverProfile.rating % 1 > 0
                                                ? 'text-yellow-300'
                                                : 'text-gray-300'
                                        }`}>
                                        {i < Math.floor(driverProfile.rating) ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{driverProfile.totalRides} completed rides</span>
                            <span>Last rated: 2 days ago</span>
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold">Your Vehicle</h3>
                            <button 
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                onClick={() => setShowVehicleModal(true)}
                            >
                                Edit
                            </button>
                        </div>
                        {driverProfile.vehicleInfo.make ? (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-gray-500">Make</p>
                                    <p className="font-medium">{driverProfile.vehicleInfo.make}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Model</p>
                                    <p className="font-medium">{driverProfile.vehicleInfo.model}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Year</p>
                                    <p className="font-medium">{driverProfile.vehicleInfo.year}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">License</p>
                                    <p className="font-medium">{driverProfile.vehicleInfo.licensePlate}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Color</p>
                                    <p className="font-medium">{driverProfile.vehicleInfo.color}</p>
                                </div>
                            </div>
                        ) : (
                            <button 
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium transition-colors"
                                onClick={() => setShowVehicleModal(true)}
                            >
                                Add Vehicle Information
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Vehicle Info Modal */}
            {showVehicleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">
                                {driverProfile.vehicleInfo.make ? 'Update Vehicle' : 'Add Vehicle'}
                            </h3>
                            <button 
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowVehicleModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleVehicleUpdate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                                    <input
                                        type="text"
                                        name="make"
                                        value={vehicleFormData.make}
                                        onChange={handleVehicleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={vehicleFormData.model}
                                        onChange={handleVehicleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={vehicleFormData.year}
                                        onChange={handleVehicleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                        min="2000"
                                        max={new Date().getFullYear() + 1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                                    <input
                                        type="text"
                                        name="licensePlate"
                                        value={vehicleFormData.licensePlate}
                                        onChange={handleVehicleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={vehicleFormData.color}
                                        onChange={handleVehicleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    onClick={() => setShowVehicleModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverPage;