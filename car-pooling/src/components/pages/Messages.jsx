import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Messages = () => {
  const { rideId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const userId = localStorage.getItem('userId');
  const driverId = localStorage.getItem('driverId')

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/messages/${rideId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const { data } = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [rideId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/messages/addmessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride: rideId,
          sender: userId,
          receiver: driverId,
          content: newMessage,
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h2 className="text-2xl font-bold mb-6">Ride Chat</h2>

      {/* Messages */}
      <div className="mb-4 h-96 overflow-y-auto bg-gray-800 p-4 rounded-lg">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => (
            <div key={message._id} className={`mb-4 p-3 rounded-lg ${message.sender._id === userId ? 'bg-blue-500 ml-auto' : 'bg-gray-700'}`}> 
              <p className="text-sm font-semibold">{message.sender._id === userId ? 'You' : message.sender.name}</p>
              <p>{message.content}</p>
              <span className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </div>

      {/* Input Section */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;
