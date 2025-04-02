import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  FaCar,
  FaMapMarkedAlt,
  FaChartLine,
  FaHeadset,
  FaShieldAlt,
} from "react-icons/fa";
import { FiClock, FiDollarSign } from "react-icons/fi";

const DriverLandingPage = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {/* <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FaCar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                DriveConnect
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Testimonials
              </a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-gray-900"
            >
              Maximize Your <span className="text-blue-600">Earnings</span> on
              the Road
            </motion.h1>
            <motion.p
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600"
            >
              Join thousands of drivers increasing their income with our
              intelligent platform designed to optimize your rides and maximize
              profits.
            </motion.p>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex space-x-4"
            >
              <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                Get Started
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors">
                Learn More
              </button>
            </motion.div>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="md:w-1/2 mt-10 md:mt-0"
          >
            <img
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="Happy driver"
              className="rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose DriveConnect?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform is designed by drivers, for drivers. We understand
              your needs and built tools to help you succeed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                initial="hidden"
                animate={controls}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-blue-600 text-3xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6"
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get started in just a few simple steps and begin earning more
              today.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-0 h-full w-1 bg-blue-200 transform -translate-x-1/2"></div>
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`mb-12 flex flex-col lg:flex-row ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center`}
              >
                <div className="lg:w-1/2 mb-6 lg:mb-0 lg:px-12">
                  <div className="bg-white p-2 rounded-full w-16 h-16 flex items-center justify-center shadow-md mb-4 mx-auto lg:mx-0">
                    <div className="text-blue-600 text-2xl">{step.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 text-center lg:text-left">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center lg:text-left">
                    {step.description}
                  </p>
                </div>
                <div className="lg:w-1/2">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="rounded-lg shadow-md w-full max-w-md mx-auto hover:shadow-lg transition-shadow"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Boost Your Earnings?
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-8 max-w-3xl mx-auto"
          >
            Join thousands of drivers who are already earning more with
            DriveConnect.
          </motion.p>
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white text-blue-600 px-8 py-4 rounded-md font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            Sign Up Now - It's Free!
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FaCar className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-xl font-bold text-white">
                  DriveConnect
                </span>
              </div>
              <p className="mb-4">
                Empowering drivers to earn more with smart technology.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Safety
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>
              &copy; {new Date().getFullYear()} DriveConnect. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Data
const features = [
  {
    icon: <FaMapMarkedAlt />,
    title: "Smart Routing",
    description:
      "Our AI-powered routing finds you the most profitable rides with minimal downtime between trips.",
  },
  {
    icon: <FiDollarSign />,
    title: "Higher Earnings",
    description:
      "Drivers using our platform earn 25% more on average compared to standard ride-sharing apps.",
  },
  {
    icon: <FiClock />,
    title: "Flexible Hours",
    description:
      "Work when you want. Our platform helps you maximize earnings during your preferred driving times.",
  },
  {
    icon: <FaChartLine />,
    title: "Performance Insights",
    description:
      "Detailed analytics help you understand your earning patterns and optimize your strategy.",
  },
  {
    icon: <FaHeadset />,
    title: "24/7 Support",
    description:
      "Our dedicated driver support team is available around the clock to assist you.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Safety First",
    description:
      "Advanced safety features give you peace of mind on every trip.",
  },
];

const stats = [
  { value: "25K+", label: "Active Drivers" },
  { value: "$500M+", label: "Paid to Drivers" },
  { value: "4.9★", label: "Average Rating" },
  { value: "24/7", label: "Support Available" },
];

const steps = [
  {
    title: "Sign Up in Minutes",
    description:
      "Complete our simple registration process and get approved quickly. No lengthy paperwork required.",
    icon: "1",
    image:
      "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    title: "Connect Your Vehicle",
    description:
      "Add your vehicle details and required documents. Our platform works with most modern vehicles.",
    icon: "2",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1583&q=80",
  },
  {
    title: "Start Earning",
    description:
      "Hit the road and begin accepting rides. Our smart system helps you maximize your earnings from day one.",
    icon: "3",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80",
  },
];

export default DriverLandingPage;
