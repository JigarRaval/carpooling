import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSpinner } from 'react-icons/fa';
import { FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();

  const password = watch('password');

  const submitHandler = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password
      };

      const res = await axios.post('/adduser', payload);

      if (res.status === 201) {
        toast.success('Registration successful! Redirecting to login...', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'dark',
          transition: Bounce,
        });

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Create Your Account
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Join us to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="johndoe@example.com"
                />
              </div>
              {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                {...register('phoneNumber', {
                  required: 'Phone Number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Invalid phone number (10 digits required)',
                  },
                })}
                className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="1234567890"
              />
            </div>
            {errors.phoneNumber && <p className="text-sm text-red-400 mt-1">{errors.phoneNumber.message}</p>}
          </div>

          {/* Password and Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="********"
                />
              </div>
              {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  className="w-full pl-10 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="********"
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-400 mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 flex items-center justify-center"
          >
            {isLoading ? <FaSpinner className="animate-spin mr-2" /> : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;