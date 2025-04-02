import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCar, FaBars, FaTimes } from "react-icons/fa";

const DriverNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu when clicking on a link
  const closeMobileMenu = () => setIsOpen(false);

  // Add scroll effect to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md py-2" : "bg-white py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/driver"
              className="flex items-center"
              onClick={closeMobileMenu}
            >
              <FaCar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                DriveConnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/driver/dashboard"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              activeClassName="text-blue-600"
            >
              Dashboard
            </Link>
            <Link
              to="/driver/rides"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              activeClassName="text-blue-600"
            >
              My Rides
            </Link>
            <Link
              to="/driver/earnings"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              activeClassName="text-blue-600"
            >
              Earnings
            </Link>
            <Link
              to="/driver/support"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              activeClassName="text-blue-600"
            >
              Support
            </Link>
            <div className="relative group ml-4">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <span className="font-medium">Account</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  to="/driver/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/driver/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={closeMobileMenu}
                >
                  Settings
                </Link>
                <Link
                  to="/driver/logout"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  onClick={closeMobileMenu}
                >
                  Logout
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <Link
            to="/driver/dashboard"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>
          <Link
            to="/driver/rides"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            onClick={closeMobileMenu}
          >
            My Rides
          </Link>
          <Link
            to="/driver/earnings"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            onClick={closeMobileMenu}
          >
            Earnings
          </Link>
          <Link
            to="/driver/support"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            onClick={closeMobileMenu}
          >
            Support
          </Link>
          <div className="pt-4 pb-2 border-t border-gray-200">
            <div className="px-3 py-2 text-sm font-medium text-gray-500">
              Account
            </div>
            <Link
              to="/driver/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              onClick={closeMobileMenu}
            >
              Profile
            </Link>
            <Link
              to="/driver/settings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              onClick={closeMobileMenu}
            >
              Settings
            </Link>
            <Link
              to="/driver/logout"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              onClick={closeMobileMenu}
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DriverNavbar;
