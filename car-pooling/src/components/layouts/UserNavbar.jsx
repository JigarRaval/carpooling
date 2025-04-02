import React, { useState, useEffect } from "react";
import { FiMenu, FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const UserNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status when component mounts or location changes
    const userData = JSON.parse(localStorage.getItem("userData"));
    const token = localStorage.getItem("token");
    if (userData && token) {
      setUser(userData);
    } else {
      setUser(null);
    }
  }, [location]);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("role");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Find a Ride", path: "/addride" },
    { label: "My Rides", path: "/myrides" },
  ];

  return (
    <nav className="bg-gray-600 text-white shadow-lg border-b border-gray-700 sticky top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/src/assets/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold">RideShare</span>
        </Link>

        {/* Mobile Menu Button */}
        <button onClick={toggleMobileMenu} className="md:hidden">
          <FiMenu className="w-6 h-6" />
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="text-white text-xl"
                  onClick={toggleMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="text-white text-xl"
                    onClick={toggleMobileMenu}
                  >
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="text-white text-xl">
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-white text-xl"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
              )}
              <button className="text-gray-400" onClick={toggleMobileMenu}>
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Menu and User Section */}
        <div className="hidden md:flex space-x-6 items-center">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`text-gray-300 hover:text-white ${
                isActive(item.path) ? "text-white font-bold" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2"
              >
                <FiUser className="w-6 h-6" />
                <span>{user.name || "Profile"}</span>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
