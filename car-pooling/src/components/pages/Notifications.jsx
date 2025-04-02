import React, { useState, useEffect, useContext } from 'react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Replace with actual user id from your auth logic
        const userId = '1234567890abcdef12345678';
        fetch(`http://localhost:5000/api/notifications?userId=${userId}`)
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className={`notifications-page `}>
            <h1>Notifications</h1>
            {notifications.length === 0 ? (
                <p>No notifications.</p>
            ) : (
                <ul>
                    {notifications.map(note => (
                        <li key={note._id}>
                            {note.message} - <small>{new Date(note.createdAt).toLocaleString()}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Notifications;
