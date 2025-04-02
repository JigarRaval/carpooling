import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import homeimage from "../../assets/homeimage.png";
import { Footer } from './Footer';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">

            {/* Navigation Section */}


            {/* Hero Section */}
            <section className="container mx-auto py-16 flex flex-col-reverse md:flex-row items-center justify-evenly">
                {/* Left Side Content */}
                <div className="max-w-lg text-center md:text-left">
                    <motion.h2
                        className="text-5xl font-bold mb-6"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                    >
                        Go anywhere with <span className="text-blue-500">Car-Pooling</span>
                    </motion.h2>
                    <p className="text-gray-400 mb-8">
                        Connecting drivers and passengers for affordable, eco-friendly transportation.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/register" className="bg-blue-600 px-8 py-4 rounded-full hover:bg-blue-700">Get Started</Link>
                    </motion.div>
                </div>

                {/* Right Side Image */}
                <motion.img
                    src={homeimage}
                    alt="Ride Sharing"
                    className="w-full md:w-[500px] rounded-xl shadow-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                />
            </section>

            {/* Project Details Section */}
            <section className="py-20 md:py-10 px-8 md:px-20">
                <h3 className="text-4xl font-bold mb-8">Why Choose Car-Pooling?</h3>
                <p className="text-gray-400 mb-6">
                    Reduce your carbon footprint and transportation expenses while making meaningful connections. Our platform ensures reliable, secure, and efficient rides.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: "Real-Time Tracking", desc: "Track your rides with ease using GPS." },
                        { title: "Cashless Payments", desc: "Secure and fast transactions." },
                        { title: "Driver & Passenger Ratings", desc: "Promoting safety and reliability." },
                        { title: "Eco-Friendly Transport", desc: "Reduce emissions with ride-sharing." },
                        { title: "AI Ride Matching", desc: "Efficient route matching for drivers and passengers." },
                        { title: "Emergency Assistance", desc: "Immediate support during emergencies." }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="p-6 bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                        >
                            <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                            <p className="text-gray-400">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>


        </div>
    );
};

export default HomePage;
