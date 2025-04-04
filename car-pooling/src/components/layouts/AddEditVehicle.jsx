import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCar, FaSave, FaTrash, FaArrowLeft } from "react-icons/fa";

const AddEditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vehicleType: "sedan",
    registration: {
      number: "",
      expiry: "",
      document: "",
    },
    insurance: {
      provider: "",
      policyNumber: "",
      expiry: "",
      document: "",
    },
  });

  // Create axios instance with auth token
  const api = axios.create({
    baseURL: "/api/drivers",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/vehicle/${id}`);
      setFormData({
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
        licensePlate: data.licensePlate,
        vehicleType: data.vehicleType,
        registration: data.registration || {
          number: "",
          expiry: "",
          document: "",
        },
        insurance: data.insurance || {
          provider: "",
          policyNumber: "",
          expiry: "",
          document: "",
        },
      });
    } catch (error) {
      toast.error("Failed to load vehicle data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (parent, e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (isEditing) {
        await api.put(`/vehicle/${id}`, formData);
        toast.success("Vehicle updated successfully");
      } else {
        await api.post("/vehicle", formData);
        toast.success("Vehicle added successfully");
      }

      navigate("/driver/vehicle");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to save vehicle";
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this vehicle?"))
      return;

    try {
      setLoading(true);
      await api.delete(`/vehicle/${id}`);
      toast.success("Vehicle deleted successfully");
      navigate("/driver/vehicle");
    } catch (error) {
      toast.error("Failed to delete vehicle");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/driver/vehicle")}
            className="flex items-center text-teal-600 hover:text-teal-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Vehicle
          </button>
          {isEditing && (
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <FaTrash className="mr-2" />
              Delete Vehicle
            </button>
          )}
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              <FaCar className="inline mr-2" />
              {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Vehicle Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                  Vehicle Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Make *
                  </label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="year"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Color *
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Plate *
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                    <option value="luxury">Luxury</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Documents</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.registration.number}
                    onChange={(e) => handleNestedChange("registration", e)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Expiry
                  </label>
                  <input
                    type="date"
                    name="expiry"
                    value={formData.registration.expiry?.split("T")[0] || ""}
                    onChange={(e) => handleNestedChange("registration", e)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Document URL
                  </label>
                  <input
                    type="url"
                    name="document"
                    value={formData.registration.document}
                    onChange={(e) => handleNestedChange("registration", e)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-700">
                    Insurance
                  </h4>

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Provider
                    </label>
                    <input
                      type="text"
                      name="provider"
                      value={formData.insurance.provider}
                      onChange={(e) => handleNestedChange("insurance", e)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Policy Number
                    </label>
                    <input
                      type="text"
                      name="policyNumber"
                      value={formData.insurance.policyNumber}
                      onChange={(e) => handleNestedChange("insurance", e)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiry"
                      value={formData.insurance.expiry?.split("T")[0] || ""}
                      onChange={(e) => handleNestedChange("insurance", e)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Document URL
                    </label>
                    <input
                      type="url"
                      name="document"
                      value={formData.insurance.document}
                      onChange={(e) => handleNestedChange("insurance", e)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <FaSave className="mr-2" />
                {isEditing ? "Update Vehicle" : "Add Vehicle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditVehicle;
