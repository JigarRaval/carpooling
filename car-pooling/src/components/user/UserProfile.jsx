import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEnvelope, FaPhone, FaUserTag, FaCar, FaStar, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('id');

      if (!userId) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`/profile/${userId}`);
        setUser(response.data.data);
        setFormData(response.data.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/profile/${user._id}`, formData);
      setUser(response.data.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (!user) {
    return <div className="text-center mt-20 text-xl">Loading user data...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 px-4 py-8">
      <div className="bg-gray-800 shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6 text-center">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg border-4 border-white"
            />
          ) : (
            <FaUserCircle className="w-32 h-32 text-gray-200 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-200">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          <button
            onClick={() => setEditMode(!editMode)}
            className="mt-4 px-6 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center mx-auto"
          >
            <FaEdit className="mr-2" /> {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {editMode ? (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Name */}
              <div className="flex items-center space-x-4">
                <FaUserTag className="text-teal-500 w-6 h-6" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300"
                  placeholder="Full Name"
                />
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <FaEnvelope className="text-teal-500 w-6 h-6" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300"
                  placeholder="Email Address"
                />
              </div>

              {/* Phone Number */}
              <div className="flex items-center space-x-4">
                <FaPhone className="text-teal-500 w-6 h-6" />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300"
                  placeholder="Phone Number"
                />
              </div>

              {/* Vehicle Type (for drivers) */}
              {user.role === 'driver' && (
                <div className="flex items-center space-x-4">
                  <FaCar className="text-teal-500 w-6 h-6" />
                  <input
                    type="text"
                    name="vehicleDetails.vehicleType"
                    value={formData.vehicleDetails?.vehicleType}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300"
                    placeholder="Vehicle Type"
                  />
                </div>
              )}

              {/* Save Changes Button */}
              <button
                type="submit"
                className="w-full py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-300"
              >
                Save Changes
              </button>
            </motion.form>
          ) : (
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-center space-x-4">
                <FaEnvelope className="text-teal-500 w-6 h-6" />
                <p className="text-gray-100 font-semibold">{user.email}</p>
              </div>

              {/* Phone Number */}
              <div className="flex items-center space-x-4">
                <FaPhone className="text-teal-500 w-6 h-6" />
                <p className="text-gray-100 font-semibold">{user.phoneNumber}</p>
              </div>

              {/* Role */}
              <div className="flex items-center space-x-4">
                <FaUserTag className="text-teal-500 w-6 h-6" />
                <p className="text-gray-100 font-semibold">{user.role}</p>
              </div>

              {/* Vehicle Type (for drivers) */}
              {user.role === 'driver' && (
                <div className="flex items-center space-x-4">
                  <FaCar className="text-teal-500 w-6 h-6" />
                  <p className="text-gray-100 font-semibold">{user.vehicleDetails?.vehicleType}</p>
                </div>
              )}

              {/* Ratings */}
              <div className="flex items-center space-x-4">
                <FaStar className="text-teal-500 w-6 h-6" />
                <p className="text-gray-100 font-semibold">
                  Average Rating:
                  {Array.isArray(user.ratings) && user.ratings.length > 0
                    ? (user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length).toFixed(2)
                    : 'No ratings yet'}
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};