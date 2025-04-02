import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OfferRide = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    date: new Date(),
    time: "",
    availableSeats: 1,
    price: "",
    carModel: "",
    licensePlate: "",
    additionalInfo: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.origin.trim()) newErrors.origin = "Origin is required";
    if (!formData.destination.trim())
      newErrors.destination = "Destination is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (formData.availableSeats < 1)
      newErrors.availableSeats = "At least 1 seat required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.carModel.trim()) newErrors.carModel = "Car model is required";
    if (!formData.licensePlate.trim())
      newErrors.licensePlate = "License plate is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/rides", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/driver/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to create ride. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Offer a Ride</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="origin">
              Origin
            </label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.origin ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Starting point"
            />
            {errors.origin && (
              <p className="text-red-500 text-sm mt-1">{errors.origin}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="destination">
              Destination
            </label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.destination ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Destination"
            />
            {errors.destination && (
              <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="date">
              Date
            </label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              minDate={new Date()}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="time">
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.time ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time}</p>
            )}
          </div>

          <div>
            <label
              className="block text-gray-700 mb-2"
              htmlFor="availableSeats"
            >
              Available Seats
            </label>
            <input
              type="number"
              id="availableSeats"
              name="availableSeats"
              min="1"
              max="10"
              value={formData.availableSeats}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.availableSeats ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.availableSeats && (
              <p className="text-red-500 text-sm mt-1">
                {errors.availableSeats}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="price">
              Price per Seat ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              min="1"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="carModel">
              Car Model
            </label>
            <input
              type="text"
              id="carModel"
              name="carModel"
              value={formData.carModel}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.carModel ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Toyota Camry"
            />
            {errors.carModel && (
              <p className="text-red-500 text-sm mt-1">{errors.carModel}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="licensePlate">
              License Plate
            </label>
            <input
              type="text"
              id="licensePlate"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.licensePlate ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., ABC123"
            />
            {errors.licensePlate && (
              <p className="text-red-500 text-sm mt-1">{errors.licensePlate}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="additionalInfo">
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special instructions or details about the ride..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/driver/dashboard")}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Ride"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferRide;
