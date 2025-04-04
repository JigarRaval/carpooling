import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCar, FaSave, FaTrash, FaArrowLeft } from "react-icons/fa";

const VehicleForm = () => {
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
      const { data } = await api.get("/vehicle");
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent, e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (isEditing) {
        await api.put("/vehicle", formData);
        toast.success("Vehicle updated successfully");
      } else {
        await api.post("/vehicle", formData);
        toast.success("Vehicle added successfully");
      }

      navigate("/driver/dashboard?tab=vehicle");
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
      await api.delete("/vehicle");
      toast.success("Vehicle deleted successfully");
      navigate("/driver/dashboard?tab=vehicle");
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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/driver/dashboard?tab=vehicle")}
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
            {/* ... rest of your form code ... */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;
