import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
// import { DriverNavbar } from './DriverNavbar';
import { FiUser, FiCreditCard, FiSave, FiEdit, FiX } from 'react-icons/fi';
import DriverNavbar from './DriverNavbar';

const DriverProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        licenseExpiry: ''
    });
    const [vehicle, setVehicle] = useState({
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        color: '',
        vehicleType: 'sedan'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/driver/profile', {
                    headers: { 'x-auth-token': token }
                });

                setProfile({
                    name: res.data.user?.name || '',
                    email: res.data.user?.email || '',
                    phone: res.data.user?.phone || '',
                    licenseNumber: res.data.licenseNumber || '',
                    licenseExpiry: res.data.licenseExpiry ? new Date(res.data.licenseExpiry).toISOString().split('T')[0] : ''
                });

                if (res.data.vehicle) {
                    setVehicle({
                        make: res.data.vehicle.make || '',
                        model: res.data.vehicle.model || '',
                        year: res.data.vehicle.year || '',
                        licensePlate: res.data.vehicle.licensePlate || '',
                        color: res.data.vehicle.color || '',
                        vehicleType: res.data.vehicle.vehicleType || 'sedan'
                    });
                }

                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (location.search.includes('vehicle_required=true')) {
            setIsEditing(true);
        }
    }, [location]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleVehicleChange = (e) => {
        const { name, value } = e.target;
        setVehicle(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const token = localStorage.getItem('token');

            // Update profile
            await axios.put('/api/driver/profile', profile, {
                headers: { 'x-auth-token': token }
            });

            // Update vehicle
            await axios.put('/api/driver/vehicle', vehicle, {
                headers: { 'x-auth-token': token }
            });

            setIsEditing(false);
            setIsLoading(false);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error(err);
            }
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <DriverNavbar />
                <div className="container mx-auto py-8 px-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* <DriverNavbar /> */}
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                    {isEditing ? (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <FiX className="mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                                <FiSave className="mr-2" />
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <FiEdit className="mr-2" />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-blue-600 px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center">
                                <FiUser className="mr-2" />
                                Personal Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                ) : (
                                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.name}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Email</label>
                                <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.email}</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.phone || 'Not provided'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-blue-600 px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center">
                                <FiCreditCard className="mr-2" />
                                Driver License
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">License Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        value={profile.licenseNumber}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                ) : (
                                    <p className="px-4 py-2 bg-gray-50 rounded-lg">{profile.licenseNumber}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">License Expiry Date</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="licenseExpiry"
                                        value={profile.licenseExpiry}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                ) : (
                                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                                        {profile.licenseExpiry ? new Date(profile.licenseExpiry).toLocaleDateString() : 'Not set'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-blue-600 px-6 py-4">
                            <h2 className="text-lg font-semibold text-white flex items-center">

                                Vehicle Information
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 mb-2">Make</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="make"
                                            value={vehicle.make}
                                            onChange={handleVehicleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    ) : (
                                        <p className="px-4 py-2 bg-gray-50 rounded-lg">{vehicle.make || 'Not set'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Model</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="model"
                                            value={vehicle.model}
                                            onChange={handleVehicleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    ) : (
                                        <p className="px-4 py-2 bg-gray-50 rounded-lg">{vehicle.model || 'Not set'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Year</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="year"
                                            value={vehicle.year}
                                            onChange={handleVehicleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                            min="2000"
                                            max={new Date().getFullYear() + 1}
                                        />
                                    ) : (
                                        <p className="px-4 py-2 bg-gray-50 rounded-lg">{vehicle.year || 'Not set'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">License Plate</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="licensePlate"
                                            value={vehicle.licensePlate}
                                            onChange={handleVehicleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    ) : (
                                        <p className="px-4 py-2 bg-gray-50 rounded-lg">{vehicle.licensePlate || 'Not set'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Color</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="color"
                                            value={vehicle.color}
                                            onChange={handleVehicleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    ) : (
                                        <p className="px-4 py-2 bg-gray-50 rounded-lg">{vehicle.color || 'Not set'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Vehicle Type</label>
                                    {isEditing ? (
                                        <select
                                            name="vehicleType"
                                            value={vehicle.vehicleType}
                                            onChange={handleVehicleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="sedan">Sedan</option>
                                            <option value="suv">SUV</option>
                                            <option value="van">Van</option>
                                            <option value="luxury">Luxury</option>
                                        </select>
                                    ) : (
                                        <p className="px-4 py-2 bg-gray-50 rounded-lg capitalize">{vehicle.vehicleType || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverProfile;