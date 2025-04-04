import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";
import { FiMail, FiLock } from "react-icons/fi";

const Login = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const submitHandler = async (data) => {
    try {
      setIsLoading(true);

      const response = await axios.post("/user/login", data, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const userData = response.data.data;
        console.log(userData);
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("token", userData.token);
        localStorage.setItem("id", userData._id);
        localStorage.setItem("role", userData.role);

        if (onLogin) {
          onLogin(userData);
        }

        toast.success(response.data.message || "Login successful!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });

        navigate(userData.role === "driver" ? "/driver/dashboard" : "/");
      }
    } catch (error) {
      let errorMessage = "Login failed";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4"
      style={{ animation: "fadeIn 0.5s ease-out" }}
    >
      <ToastContainer />
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Sign in to continue your journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
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
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
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
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-400 mt-1 animate-fadeIn">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-500 focus:ring-teal-500 bg-gray-700 border-gray-600 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-300"
              >
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-teal-400 hover:text-teal-300 transition-colors duration-200 font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Animation styles */}
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

export default Login;
