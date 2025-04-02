import React, { useEffect, useState } from 'react';
import { UserNavbar } from './UserNavbar';
import { DriverNavbar } from './DriverNavbar';
import { useLocation } from 'react-router-dom';

export const NavbarSelector = () => {
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        // Check localStorage for user role
        const role = localStorage.getItem('role');
        setUserRole(role);

        // Optional: Listen for storage changes
        const handleStorageChange = () => {
            const updatedRole = localStorage.getItem('role');
            setUserRole(updatedRole);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [location]);

    if (userRole === 'driver') {
        return <DriverNavbar />;
    } else if (userRole === 'passenger' || userRole === 'admin') {
        return <UserNavbar />;
    }

    // Default navbar (when not logged in or role not set)
    return <UserNavbar />;
};