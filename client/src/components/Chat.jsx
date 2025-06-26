import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../utils/auth';
import io from 'socket.io-client';

const ChatWindow = ({ sellerId, sellerName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || !sellerId) return;

    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    setSocket(newSocket);

    // Join chat room
    newSocket.emit('join-chat', { userId: user.id, sellerId });

    // Listen for incoming messages
    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Load existing chat history
    loadChatHistory();

    return () => {
      newSocket.close();
    };
  }, [user, sellerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      recipientId: sellerId,
      content: newMessage.trim()
    };

    // Emit message through socket
    socket.emit('send-message', messageData);

    // Add to local state immediately for better UX
    const tempMessage = {
      sender: { _id: user.id, name: user.name },
      content: newMessage.trim(),
      timestamp: new Date(),
      _id: Date.now() // temporary ID
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (!user) {
    return (
      <div className="alert alert-warning">
        Please login to chat with the seller.
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
               style={{ width: '35px', height: '35px' }}>
            {sellerName?.charAt(0) || 'S'}
          </div>
          <div>
            <h6 className="mb-0">Chat with {sellerName}</h6>
            <small className="text-muted">Online</small>
          </div>
        </div>
        <button className="btn-close" onClick={onClose}></button>
      </div>

      <div className="card-body flex-grow-1 overflow-auto p-3" style={{ maxHeight: '350px' }}>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : Object.keys(messageGroups).length === 0 ? (
          <div className="text-center text-muted">
            <i className="bi bi-chat-dots display-4"></i>
            <p className="mt-2">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dayMessages]) => (
            <div key={date}>
              <div className="text-center mb-3">
                <small className="bg-light px-3 py-1 rounded-pill text-muted">
                  {date}
                </small>
              </div>
              
              {dayMessages.map((message, index) => {
                const isOwnMessage = message.sender._id === user.id;
                return (
                  <div
                    key={message._id || index}
                    className={`d-flex mb-3 ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      className={`message-bubble p-2 rounded-3 ${
                        isOwnMessage 
                          ? 'bg-primary text-white' 
                          : 'bg-light'
                      }`}
                      style={{ maxWidth: '70%' }}
                    >
                      <div className="message-content">
                        {message.content}
                      </div>
                      <div className={`message-time small mt-1 ${isOwnMessage ? 'text-white-50' : 'text-muted'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="card-footer">
        <form onSubmit={handleSendMessage}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!newMessage.trim()}
            >
              <i className="bi bi-send"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChatButton = ({ sellerId, sellerName }) => {
  const [showChat, setShowChat] = useState(false);
  const user = getCurrentUser();

  if (!user || !sellerId || user.id === sellerId) {
    return null;
  }

  return (
    <>
      <button 
        className="btn btn-outline-success"
        onClick={() => setShowChat(true)}
      >
        <i className="bi bi-chat-dots me-1"></i>
        Chat with Seller
      </button>

      {showChat && (
        <div 
          className="position-fixed" 
          style={{ 
            bottom: '20px', 
            right: '20px', 
            zIndex: 1050, 
            width: '400px',
            maxWidth: '90vw'
          }}
        >
          <ChatWindow 
            sellerId={sellerId} 
            sellerName={sellerName}
            onClose={() => setShowChat(false)} 
          />
        </div>
      )}
    </>
  );
};

export { ChatWindow, ChatButton };

// Default export for easy importing
export default ChatWindow;
