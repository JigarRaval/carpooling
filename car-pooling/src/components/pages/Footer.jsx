import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaCarSide, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 ml-12">
        {/* About Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 ml-5">About CarPooling</h2>
          <p className="text-gray-400 ml-5">Connecting drivers and passengers for a seamless and affordable travel experience. Travel smarter with RideShare.</p>
        </div>

        {/* Quick Links */}
        <div className='ml-18'>
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <ul className="space-y-3">
            <li><Link to="/" className="hover:text-teal-400">Home</Link></li>
            <li><Link to="/myrides" className="hover:text-teal-400">My Rides</Link></li>
            <li><Link to="/messages" className="hover:text-teal-400">Messages</Link></li>
            <li><Link to="/addride" className="hover:text-teal-400">Add a Ride</Link></li>
          </ul>
        </div>

        {/* Contact & Socials */}
        <div>
          <h2 className="text-xl font-bold mb-4">Contact Us</h2>
          <div className="flex items-center space-x-3 mb-3">
            <FaPhoneAlt />
            <p>+1 (234) 567-8901</p>
          </div>
          <div className="flex items-center space-x-3 mb-3">
            <FaEnvelope />
            <p>support@rideshare.com</p>
          </div>

          <h2 className="text-xl font-bold mt-6 mb-4">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-teal-400"><FaFacebook size={24} /></a>
            <a href="#" className="hover:text-teal-400"><FaTwitter size={24} /></a>
            <a href="#" className="hover:text-teal-400"><FaInstagram size={24} /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-500 mt-12">
        <p>&copy; {new Date().getFullYear()} RideShare. All rights reserved.</p>
      </div>
    </footer>
  );
};
