import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentUser } from '../utils/auth';
import io from 'socket.io-client';

const ChatWindow = ({ sellerId, sellerName, productId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatHistoryLoaded = useRef(false);
  const previousMessageCount = useRef(0);
  const user = getCurrentUser();

  const loadChatHistory = useCallback(async () => {
    if (chatHistoryLoaded.current) return; // Prevent multiple loads
    
    try {
      setLoading(true);
      chatHistoryLoaded.current = true;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      
      // Only scroll to bottom when chat history is first loaded
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
      chatHistoryLoaded.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  }, [sellerId]); // Only depend on sellerId

  useEffect(() => {
    if (!user || !sellerId) return;

    // Initialize socket connection only once per sellerId
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
      setMessages(prev => {
        // Prevent duplicate messages
        const exists = prev.some(msg => msg._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    // Listen for socket errors
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Listen for connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Load existing chat history only once per sellerId
    loadChatHistory();

    return () => {
      if (newSocket) {
        newSocket.off('new-message');
        newSocket.off('error');
        newSocket.off('connect_error');
        newSocket.close();
      }
      chatHistoryLoaded.current = false; // Reset when sellerId changes
    };
  }, [sellerId, loadChatHistory]); // Depend on sellerId and loadChatHistory

  // Only scroll when there are actually new messages (message count increased)
  useEffect(() => {
    if (messages.length > previousMessageCount.current && previousMessageCount.current > 0) {
      // New message detected, scroll the chat container only
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
    previousMessageCount.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    const messageData = {
      recipientId: sellerId,
      content: messageContent
    };

    try {
      setIsSending(true);
      setNewMessage(''); // Clear input immediately
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add the new message to the chat
      if (data.message) {
        setMessages(prev => {
          // Prevent duplicates by checking if message already exists
          const messageExists = prev.some(existingMsg => existingMsg._id === data.message._id);
          if (messageExists) return prev;
          return [...prev, data.message];
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Re-add the message to input on error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
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

      <div className="card-body flex-grow-1 overflow-auto p-3" ref={messagesContainerRef} style={{ maxHeight: '350px' }}>
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
                const isAIMessage = message.isAI;
                return (
                  <div
                    key={message._id || index}
                    className={`d-flex mb-3 ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      className={`message-bubble p-2 rounded-3 ${
                        isOwnMessage 
                          ? 'bg-primary text-white' 
                          : isAIMessage
                          ? 'bg-info text-white'
                          : 'bg-light'
                      }`}
                      style={{ maxWidth: '70%' }}
                    >
                      {isAIMessage && (
                        <div className="d-flex align-items-center mb-1">
                          <i className="bi bi-robot me-1" style={{ fontSize: '0.8rem' }}></i>
                          <small className="text-white-50">AI Assistant</small>
                        </div>
                      )}
                      <div className="message-content">
                        {message.content}
                      </div>
                      <div className={`message-time small mt-1 ${
                        isOwnMessage || isAIMessage ? 'text-white-50' : 'text-muted'
                      }`}>
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
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                <i className="bi bi-send"></i>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChatButton = ({ sellerId, sellerName, productId }) => {
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
            productId={productId}
            onClose={() => setShowChat(false)} 
          />
        </div>
      )}
    </>
  );
};

export { ChatWindow, ChatButton };

// Default export for ProductDetailPage compatibility
export default ChatWindow;
