import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiUser, FiX } from "react-icons/fi";
import { FaCar, FaMoneyBillWave, FaHeadset, FaCog } from "react-icons/fa";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
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
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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

  // Common Navbar Items
  const commonMenuItems = [{ label: "Home", path: "/", icon: null }];

  // Passenger Nav Items
  const passengerMenuItems = [
    { label: "Find a Ride", path: "/addride", icon: null },
    { label: "My Rides", path: "/myrides", icon: null },
  ];

  // Driver Nav Items
  const driverMenuItems = [
    {
      label: "Dashboard",
      path: "/driver/dashboard",
      icon: <FaCar className="mr-2" />,
    },
    {
      label: "My Rides",
      path: "/driver/rides",
      icon: <FaCar className="mr-2" />,
    },
    {
      label: "Earnings",
      path: "/driver/earnings",
      icon: <FaMoneyBillWave className="mr-2" />,
    },
    {
      label: "Support",
      path: "/driver/support",
      icon: <FaHeadset className="mr-2" />,
    },
  ];

  const accountMenuItems =
    user?.role === "driver"
      ? [
          {
            label: "Profile",
            path: "/driver/profile",
            icon: <FiUser className="mr-2" />,
          },
          {
            label: "Settings",
            path: "/driver/settings",
            icon: <FaCog className="mr-2" />,
          },
          { label: "Logout", action: handleLogout, icon: null },
        ]
      : [
          {
            label: "Profile",
            path: "/profile",
            icon: <FiUser className="mr-2" />,
          },
          { label: "Logout", action: handleLogout, icon: null },
        ];

  const currentMenuItems =
    user?.role === "driver"
      ? [...commonMenuItems, ...driverMenuItems]
      : [...commonMenuItems, ...passengerMenuItems];

  const NavLogo = () => (
    <Link
      to={user?.role === "driver" ? "/driver/dashboard" : "/"}
      className="flex items-center space-x-3"
      onClick={closeMobileMenu}
    >
      <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
        <FaCar className="text-white" />
      </div>
      <span className="text-xl font-semibold">
        {user?.role === "driver" ? "DriveConnect" : "RideShare"}
      </span>
    </Link>
  );

  return (
    <nav
      className={`sticky w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-800 shadow-lg py-2"
          : "bg-gradient-to-b from-gray-900 to-gray-800 py-4"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-6">
        <NavLogo />

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <FiX className="w-6 h-6" />
          ) : (
            <FiMenu className="w-6 h-6" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          {currentMenuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center text-gray-300 hover:text-white transition-colors ${
                isActive(item.path) ? "text-white font-medium" : ""
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                  <FiUser className="text-white" />
                </div>
                <span>{user.name || "Account"}</span>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-gray-700 text-white rounded-lg shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {accountMenuItems.map((item, index) =>
                      item.action ? (
                        <button
                          key={index}
                          onClick={item.action}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-600 transition-colors"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={index}
                          to={item.path}
                          className="block px-4 py-2 hover:bg-gray-600 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-95 z-50 pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="container mx-auto px-6 py-4 flex flex-col space-y-6">
              {currentMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`text-xl ${
                    isActive(item.path)
                      ? "text-white font-bold"
                      : "text-gray-300"
                  }`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-6 border-t border-gray-700">
                {user ? (
                  <>
                    {accountMenuItems.map((item, index) =>
                      item.action ? (
                        <button
                          key={index}
                          onClick={() => {
                            item.action();
                            closeMobileMenu();
                          }}
                          className="block text-xl text-gray-300 w-full text-left py-2"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={index}
                          to={item.path}
                          className="block text-xl text-gray-300 py-2"
                          onClick={closeMobileMenu}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block text-xl text-gray-300 py-2"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block text-xl text-white py-2"
                      onClick={closeMobileMenu}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;