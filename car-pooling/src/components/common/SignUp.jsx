import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner, FaCar, FaUser } from "react-icons/fa";
import { FiUser, FiMail, FiPhone, FiLock, FiCreditCard } from "react-icons/fi";

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const navigate = useNavigate();

  const password = watch("password");

  const submitHandler = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        role: isDriver ? "driver" : "passenger",
      };

      if (isDriver) {
        payload.driverDetails = {
          licenseNumber: data.licenseNumber,
          vehicleDetails: {
            make: data.make,
            model: data.model,
            year: data.year,
            color: data.color,
            licensePlate: data.licensePlate,
          },
          status: "pending_verification",
        };
      }

      const res = await axios.post("/adduser", payload);

      if (res.status === 201) {
        toast.success("Registration successful! Redirecting...", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });

        setTimeout(() => {
          navigate(isDriver ? "/driver/dashboard" : "/");
        }, 3000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4">
      <ToastContainer />
      <div
        className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]"
        style={{
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Create Your Account
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Join us to get started
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => setIsDriver(false)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                !isDriver
                  ? "bg-teal-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <FaUser className="mr-2" />
              Passenger
            </button>
            <button
              type="button"
              onClick={() => setIsDriver(true)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                isDriver
                  ? "bg-teal-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <FaCar className="mr-2" />
              Driver
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative transition-transform duration-200 hover:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative transition-transform duration-200 hover:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="johndoe@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative transition-transform duration-200 hover:scale-[1.02]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                {...register("phoneNumber", {
                  required: "Phone Number is required",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: "Invalid phone number (10-15 digits required)",
                  },
                })}
                className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="1234567890"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Password and Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative transition-transform duration-200 hover:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="********"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative transition-transform duration-200 hover:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="********"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Driver-specific fields */}
          {isDriver && (
            <div className="space-y-4 pt-4 border-t border-gray-700 animate-fadeIn">
              <h3 className="text-lg font-semibold text-white">
                Driver Information
              </h3>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Driver's License Number
                </label>
                <div className="relative transition-transform duration-200 hover:scale-[1.02]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("licenseNumber", {
                      required: isDriver ? "License number is required" : false,
                    })}
                    className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="DL123456789"
                  />
                </div>
                {errors.licenseNumber && (
                  <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                    {errors.licenseNumber.message}
                  </p>
                )}
              </div>

              {/* Vehicle Details */}
              <h4 className="text-md font-medium text-gray-300 mt-4 mb-2">
                Vehicle Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Make
                  </label>
                  <div className="transition-transform duration-200 hover:scale-[1.02]">
                    <input
                      type="text"
                      {...register("make", {
                        required: isDriver ? "Vehicle make is required" : false,
                      })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Toyota"
                    />
                  </div>
                  {errors.make && (
                    <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                      {errors.make.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model
                  </label>
                  <div className="transition-transform duration-200 hover:scale-[1.02]">
                    <input
                      type="text"
                      {...register("model", {
                        required: isDriver
                          ? "Vehicle model is required"
                          : false,
                      })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Camry"
                    />
                  </div>
                  {errors.model && (
                    <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                      {errors.model.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year
                  </label>
                  <div className="transition-transform duration-200 hover:scale-[1.02]">
                    <input
                      type="number"
                      {...register("year", {
                        required: isDriver ? "Vehicle year is required" : false,
                        min: {
                          value: 1990,
                          message: "Vehicle must be 1990 or newer",
                        },
                        max: {
                          value: new Date().getFullYear() + 1,
                          message: "Vehicle cannot be from the future",
                        },
                      })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="2020"
                    />
                  </div>
                  {errors.year && (
                    <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                      {errors.year.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="transition-transform duration-200 hover:scale-[1.02]">
                    <input
                      type="text"
                      {...register("color", {
                        required: isDriver
                          ? "Vehicle color is required"
                          : false,
                      })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Red"
                    />
                  </div>
                  {errors.color && (
                    <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                      {errors.color.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    License Plate
                  </label>
                  <div className="transition-transform duration-200 hover:scale-[1.02]">
                    <input
                      type="text"
                      {...register("licensePlate", {
                        required: isDriver
                          ? "License plate is required"
                          : false,
                      })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="ABC123"
                    />
                  </div>
                  {errors.licensePlate && (
                    <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                      {errors.licensePlate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Sign Up as ${isDriver ? "Driver" : "Passenger"}`
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-teal-400 hover:text-teal-300 transition-colors duration-200"
          >
            Login here
          </Link>
        </div>
      </div>

      {/* Add these styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SignUp;
