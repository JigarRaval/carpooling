import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DriverNavbar } from '../components/DriverNavbar';
import {
    FiMapPin, FiCalendar, FiUsers, FiDollarSign, FiNavigation,
    FiCheckCircle, FiXCircle, FiUser, FiPhone, FiMail
} from 'react-icons/fi';

const RideDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ride, setRide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [mapImage, setMapImage] = useState('');

    useEffect(() => {
        const fetchRideDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/driver/ride/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setRide(res.data);

                // Generate static map image (in a real app, use Google Maps or similar)
                const { pickup, dropoff } = res.data.coordinates;
                if (pickup.lat && dropoff.lat) {
                    setMapImage(`https://maps.googleapis.com/maps/api/staticmap?size=600x300&markers=color:red%7C${pickup.lat},${pickup.lng}&markers=color:green%7C${dropoff.lat},${dropoff.lng}&path=color:0x0000ff|weight:5|${pickup.lat},${pickup.lng}|${dropoff.lat},${dropoff.lng}&key=YOUR_API_KEY`);
                }

                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setIsLoading(false);
            }
        };

        fetchRideDetails();
    }, [id]);

    const handleRideAction = async (action) => {
        setIsActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/driver/ride/${id}/${action}`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Refresh ride details
            const res = await axios.get(`/api/driver/ride/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setRide(res.data);
        } catch (err) {
            console.error(err);
        }
        setIsActionLoading(false);
    };

    const getActionButtons = () => {
        if (!ride) return null;

        switch (ride.status) {
            case 'pending':
                return (
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleRideAction('cancel')}
                            disabled={isActionLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                        >
                            <FiXCircle className="mr-2" />
                            Cancel Ride
                        </button>
                    </div>
                );
            case 'accepted':
                return (
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleRideAction('start')}
                            disabled={isActionLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            <FiNavigation className="mr-2" />
                            Start Ride
                        </button>
                        <button
                            onClick={() => handleRideAction('cancel')}
                            disabled={isActionLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                        >
                            <FiXCircle className="mr-2" />
                            Cancel Ride
                        </button>
                    </div>
                );
            case 'in-progress':
                return (
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleRideAction('complete')}
                            disabled={isActionLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                            <FiCheckCircle className="mr-2" />
                            Complete Ride
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status]}`}>
                {status.replace('-', ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* <DriverNavbar /> */}
            <div className="container mx-auto py-8 px-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : ride ? (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Ride Details</h1>
                            <div className="flex items-center space-x-4">
                                {getStatusBadge(ride.status)}
                                <button
                                    onClick={() => navigate('/driver/my-rides')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    Back to My Rides
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {ride.departureLocation} → {ride.arrivalLocation}
                                            </h2>
                                            <p className="text-gray-500 mt-1">
                                                {new Date(ride.departureTime).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-600">
                                                ${ride.fare?.total?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {mapImage && (
                                        <div className="mb-6 rounded-lg overflow-hidden">
                                            <img
                                                src={mapImage}
                                                alt="Route Map"
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h3 className="font-medium mb-2 flex items-center">
                                                <FiMapPin className="mr-2 text-blue-600" />
                                                Pickup Location
                                            </h3>
                                            <p className="text-gray-700">{ride.departureLocation}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-2 flex items-center">
                                                <FiMapPin className="mr-2 text-green-600" />
                                                Dropoff Location
                                            </h3>
                                            <p className="text-gray-700">{ride.arrivalLocation}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-medium mb-2 flex items-center">
                                                <FiUsers className="mr-2 text-purple-600" />
                                                Passengers
                                            </h3>
                                            <p className="text-gray-700">{ride.passengers.length} / {ride.seatsAvailable}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-2 flex items-center">
                                                <FiDollarSign className="mr-2 text-yellow-600" />
                                                Fare Breakdown
                                            </h3>
                                            <div className="text-gray-700">
                                                <p>Base: ${ride.fare?.base?.toFixed(2)}</p>
                                                <p>Distance: ${ride.fare?.distance?.toFixed(2)}</p>
                                                <p>Time: ${ride.fare?.time?.toFixed(2)}</p>
                                                <p>Surge: {ride.fare?.surge}x</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-6">
                                    <h3 className="font-semibold text-lg mb-4">Passenger Details</h3>

                                    {ride.passengers.length > 0 ? (
                                        <div className="space-y-4">
                                            {ride.passengers.map((passenger) => (
                                                <div key={passenger._id} className="p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="p-2 bg-gray-100 rounded-full">
                                                            <FiUser className="text-gray-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{passenger.name}</h4>
                                                            <p className="text-sm text-gray-500">Rating: {passenger.rating?.toFixed(1) || 'New'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <FiPhone className="mr-2" />
                                                            <span>{passenger.phone || 'Not provided'}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <FiMail className="mr-2" />
                                                            <span>{passenger.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No passengers booked yet</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">Ride Actions</h3>
                                <div className="flex space-x-4">
                                    {getActionButtons()}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-500">Ride not found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideDetails;