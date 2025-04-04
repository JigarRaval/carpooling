import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiCreditCard, FiSave, FiEdit, FiX } from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import { toast } from "react-toastify";

const DriverProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    driverDetails: {
      licenseNumber: "",
      vehicleDetails: {
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
        vehicleType: "sedan",
      },
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const driverId = localStorage.getItem("id");
        const userData = JSON.parse(localStorage.getItem("userData"));

        if (!driverId || !userData) {
          toast.error("Please log in to access your profile");
          navigate("/driver/login");
          return;
        }

        // First try to use the userData from localStorage
        if (userData._id === driverId && userData.role === "driver") {
          setProfile({
            name: userData.name || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            driverDetails: {
              licenseNumber: userData.driverDetails?.licenseNumber || "",
              vehicleDetails: {
                make: userData.driverDetails?.vehicleDetails?.make || "",
                model: userData.driverDetails?.vehicleDetails?.model || "",
                year: userData.driverDetails?.vehicleDetails?.year || "",
                color: userData.driverDetails?.vehicleDetails?.color || "",
                licensePlate:
                  userData.driverDetails?.vehicleDetails?.licensePlate || "",
                vehicleType:
                  userData.driverDetails?.vehicleDetails?.vehicleType ||
                  "sedan",
              },
            },
          });
          setIsLoading(false);
          return;
        }

        // Fallback to API request if localStorage data doesn't match
        const response = await axios.get(`/api/drivers/${driverId}`);

        if (response.data?.success) {
          const driverData = response.data.data;
          setProfile({
            name: driverData.name || "",
            email: driverData.email || "",
            phoneNumber: driverData.phoneNumber || "",
            driverDetails: {
              licenseNumber: driverData.driverDetails?.licenseNumber || "",
              vehicleDetails: {
                make: driverData.driverDetails?.vehicleDetails?.make || "",
                model: driverData.driverDetails?.vehicleDetails?.model || "",
                year: driverData.driverDetails?.vehicleDetails?.year || "",
                color: driverData.driverDetails?.vehicleDetails?.color || "",
                licensePlate:
                  driverData.driverDetails?.vehicleDetails?.licensePlate || "",
                vehicleType:
                  driverData.driverDetails?.vehicleDetails?.vehicleType ||
                  "sedan",
              },
            },
          });
          // Update localStorage with fresh data
          localStorage.setItem("userData", JSON.stringify(driverData));
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error(
          err.response?.data?.message || "Failed to load profile data"
        );
        if (err.response?.status === 401 || err.response?.status === 404) {
          navigate("/driver/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("driverDetails.")) {
      const [parent, child] = name.split(".").slice(1);
      setProfile((prev) => ({
        ...prev,
        driverDetails: {
          ...prev.driverDetails,
          [parent]: child
            ? {
                ...prev.driverDetails[parent],
                [child]: value,
              }
            : value,
        },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const driverId = localStorage.getItem("id");
      if (!driverId) {
        toast.error("Session expired. Please log in again.");
        navigate("/driver/login");
        return;
      }

      // Prepare update data
      const updateData = {
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        driverDetails: {
          licenseNumber: profile.driverDetails.licenseNumber,
          vehicleDetails: profile.driverDetails.vehicleDetails,
        },
      };

      // Update driver profile
      const response = await axios.put(`/api/drivers/${driverId}`, updateData);

      if (response.data?.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        // Update localStorage with the new data
        const updatedUserData = {
          ...JSON.parse(localStorage.getItem("userData")),
          ...updateData,
        };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      } else {
        throw new Error(response.data?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        toast.error("Please fix the errors in the form");
      } else {
        toast.error(err.response?.data?.message || "Failed to update profile");
      }
      if (err.response?.status === 401 || err.response?.status === 404) {
        navigate("/driver/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
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
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Driver Profile</h1>
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
                {isLoading ? "Saving..." : "Save Changes"}
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
          {/* Personal Information */}
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
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    required
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.name}
                  </p>
                )}
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                  {profile.email}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phoneNumber ? "border-red-500" : ""
                    }`}
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.phoneNumber || "Not provided"}
                  </p>
                )}
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Driver License */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <FiCreditCard className="mr-2" />
                Driver License
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  License Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="driverDetails.licenseNumber"
                    value={profile.driverDetails.licenseNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.licenseNumber ? "border-red-500" : ""
                    }`}
                    required
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {profile.driverDetails.licenseNumber || "Not set"}
                  </p>
                )}
                {errors.licenseNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.licenseNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <FaCar className="mr-2" />
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
                      name="driverDetails.vehicleDetails.make"
                      value={profile.driverDetails.vehicleDetails.make}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors["vehicleDetails.make"] ? "border-red-500" : ""
                      }`}
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                      {profile.driverDetails.vehicleDetails.make || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Model</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="driverDetails.vehicleDetails.model"
                      value={profile.driverDetails.vehicleDetails.model}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors["vehicleDetails.model"] ? "border-red-500" : ""
                      }`}
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                      {profile.driverDetails.vehicleDetails.model || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Year</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="driverDetails.vehicleDetails.year"
                      value={profile.driverDetails.vehicleDetails.year}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors["vehicleDetails.year"] ? "border-red-500" : ""
                      }`}
                      min="1990"
                      max={new Date().getFullYear() + 1}
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                      {profile.driverDetails.vehicleDetails.year || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    License Plate
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="driverDetails.vehicleDetails.licensePlate"
                      value={profile.driverDetails.vehicleDetails.licensePlate}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors["vehicleDetails.licensePlate"]
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                      {profile.driverDetails.vehicleDetails.licensePlate ||
                        "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Color</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="driverDetails.vehicleDetails.color"
                      value={profile.driverDetails.vehicleDetails.color}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors["vehicleDetails.color"] ? "border-red-500" : ""
                      }`}
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg">
                      {profile.driverDetails.vehicleDetails.color || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  {isEditing ? (
                    <select
                      name="driverDetails.vehicleDetails.vehicleType"
                      value={profile.driverDetails.vehicleDetails.vehicleType}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors["vehicleDetails.vehicleType"]
                          ? "border-red-500"
                          : ""
                      }`}
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                      <option value="luxury">Luxury</option>
                      <option value="electric">Electric</option>
                    </select>
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg capitalize">
                      {profile.driverDetails.vehicleDetails.vehicleType ||
                        "Not set"}
                    </p>
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
