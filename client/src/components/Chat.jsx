import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentUser } from '../utils/auth';
import io from 'socket.io-client';

// Simple local AI responder - no API keys needed
const generateAIResponse = (userMessage) => {
  const message = userMessage.toLowerCase().trim();
  
  // Product-related responses
  if (message.includes('price') || message.includes('cost') || message.includes('expensive') || message.includes('cheap')) {
    const responses = [
      "Our prices are very competitive! Would you like to know about any specific product?",
      "We offer great value for money. Which product are you interested in?",
      "I'd be happy to discuss pricing with you. What caught your eye?",
      "We have various price ranges available. What's your budget?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.includes('quality') || message.includes('good') || message.includes('best')) {
    const responses = [
      "Quality is our top priority! All our products are carefully selected.",
      "We only sell high-quality items that we stand behind.",
      "Our customers love the quality of our products. Check out the reviews!",
      "You can trust our quality - we have many satisfied customers."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.includes('shipping') || message.includes('delivery') || message.includes('ship')) {
    const responses = [
      "We offer fast and reliable shipping! Usually 2-5 business days.",
      "Shipping is quick and secure. We'll send you tracking information.",
      "Free shipping on orders over $50! Where should we deliver?",
      "We ship nationwide with tracking included."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.includes('return') || message.includes('refund') || message.includes('exchange')) {
    const responses = [
      "We have a 30-day return policy for your peace of mind.",
      "Returns are easy! Just contact us within 30 days.",
      "We want you to be happy with your purchase. Returns accepted!",
      "Hassle-free returns within 30 days of purchase."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    const responses = [
      "Hello! How can I help you today?",
      "Hi there! Thanks for your interest in our products!",
      "Hey! What can I help you find?",
      "Hello! I'm here to answer any questions you have."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.includes('thank') || message.includes('thanks')) {
    const responses = [
      "You're very welcome! Happy to help!",
      "No problem at all! Let me know if you need anything else.",
      "Glad I could help! Feel free to ask more questions.",
      "You're welcome! Thanks for choosing us!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.includes('size') || message.includes('fit') || message.includes('dimension')) {
    const responses = [
      "We have detailed size information on each product page.",
      "Sizing charts are available to help you choose the right fit.",
      "What specific measurements are you looking for?",
      "I can help you find the right size. Which product interests you?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (message.includes('available') || message.includes('stock') || message.includes('in stock')) {
    const responses = [
      "Most items are in stock and ready to ship!",
      "Let me check availability for you. Which product?",
      "We keep good inventory levels. What are you looking for?",
      "Stock levels are updated regularly. Anything specific you need?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Question responses
  if (message.includes('?')) {
    const responses = [
      "That's a great question! Let me help you with that.",
      "I'd be happy to answer that for you!",
      "Thanks for asking! Here's what I can tell you...",
      "Good question! I'm here to help."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Default friendly responses
  const defaultResponses = [
    "Thanks for your message! I'm here to help with any questions.",
    "I appreciate you reaching out! How can I assist you today?",
    "Great to hear from you! What can I help you with?",
    "Thanks for contacting us! I'm happy to help.",
    "I received your message! What would you like to know?",
    "Thanks for getting in touch! How can I make your shopping experience better?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

const ChatWindow = ({ sellerId, sellerName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatHistoryLoaded = useRef(false);
  const user = getCurrentUser();

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
    if (!chatHistoryLoaded.current) {
      loadChatHistory();
    }

    async function loadChatHistory() {
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
        
        // Scroll to bottom when chat history is first loaded
        setTimeout(() => scrollToBottom(), 200);
      } catch (error) {
        console.error('Error loading chat history:', error);
        setMessages([]);
        chatHistoryLoaded.current = false; // Allow retry on error
      } finally {
        setLoading(false);
      }
    }

    return () => {
      if (newSocket) {
        newSocket.off('new-message');
        newSocket.off('error');
        newSocket.off('connect_error');
        newSocket.close();
      }
      chatHistoryLoaded.current = false; // Reset when sellerId changes
    };
  }, [sellerId]); // Only depend on sellerId

  // Handle scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider "at bottom" if within 10px of the bottom to account for rounding
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setIsUserScrolledUp(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart scroll: only auto-scroll if user is at bottom or it's their own message
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const isOwnMessage = lastMessage?.sender?._id === user?.id;
    
    // Auto-scroll only if:
    // 1. User is at the bottom of the chat, OR
    // 2. The new message is from the current user (their own message)
    if (!isUserScrolledUp || isOwnMessage) {
      // Small delay to ensure message is rendered before scrolling
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, isUserScrolledUp, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || isSending) return;

    const messageData = {
      recipientId: sellerId,
      content: newMessage.trim()
    };

    try {
      setIsSending(true);
      
      // Emit message through socket
      socket.emit('send-message', messageData);

      // Add user message to local state immediately for better UX
      const tempMessage = {
        sender: { _id: user.id, name: user.name },
        content: newMessage.trim(),
        timestamp: new Date(),
        _id: `temp-${Date.now()}` // temporary ID to prevent duplicates
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      // Generate AI response after a short delay
      const userMessageContent = newMessage.trim();
      setNewMessage('');
      
      setTimeout(() => {
        const aiResponse = generateAIResponse(userMessageContent);
        const aiMessage = {
          sender: { _id: sellerId, name: sellerName || 'Seller' },
          content: aiResponse,
          timestamp: new Date(),
          _id: `ai-${Date.now()}`
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds for realism
      
      // Reset sending state after a short delay
      setTimeout(() => setIsSending(false), 1000);
    } catch (error) {
      console.error('Error sending message:', error);
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

// Default export for ProductDetailPage compatibility
export default ChatWindow;
