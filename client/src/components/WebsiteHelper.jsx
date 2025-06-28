import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const WebsiteHelper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: "Hi! I'm your Componentary assistant. I can help you with questions about this page, our products, navigation, or anything else you need to know about our platform.",
        timestamp: new Date()
      }]);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPageContext = () => {
    const path = location.pathname;
    const search = location.search;
    
    // Get page title
    const pageTitle = document.title;
    
    // Get main content from the page
    const mainContent = document.querySelector('main, .main-content, .container');
    let pageContent = '';
    
    if (mainContent) {
      // Extract text content but limit it to avoid too much data
      const textContent = mainContent.innerText || mainContent.textContent || '';
      pageContent = textContent.substring(0, 2000); // Limit to 2000 characters
    }
    
    // Get product information if on product page
    let productInfo = {};
    if (path.includes('/product/')) {
      const productElements = {
        name: document.querySelector('h1, .product-name, .product-title'),
        price: document.querySelector('.price, .product-price, [class*="price"]'),
        description: document.querySelector('.description, .product-description'),
        category: document.querySelector('.category, .product-category'),
        stock: document.querySelector('.stock, .availability, [class*="stock"]')
      };
      
      Object.keys(productElements).forEach(key => {
        if (productElements[key]) {
          productInfo[key] = productElements[key].textContent?.trim();
        }
      });
    }
    
    return {
      currentPage: path,
      pageTitle,
      searchParams: search,
      pageContent,
      productInfo,
      timestamp: new Date().toISOString()
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const pageContext = getPageContext();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/website-helper/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          pageContext: pageContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from helper');
      }

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to website helper:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or feel free to browse our site for the information you need.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      type: 'bot',
      content: "Hi! I'm your Componentary assistant. I can help you with questions about this page, our products, navigation, or anything else you need to know about our platform.",
      timestamp: new Date()
    }]);
  };

  return (
    <>
      {/* Floating chat button */}
      <div 
        className="position-fixed d-flex flex-column align-items-end"
        style={{ 
          bottom: '20px', 
          right: '20px', 
          zIndex: 1000 
        }}
      >
        {/* Chat window */}
        {isOpen && (
          <div 
            className="border rounded-3 shadow-lg mb-3 website-helper-chat"
            style={{ 
              width: '400px', 
              maxWidth: '90vw',
              height: '500px',
              maxHeight: '70vh',
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            {/* Header */}
            <div 
              className="text-white p-3 rounded-top-3 d-flex justify-content-between align-items-center"
              style={{ 
                background: 'var(--gradient-primary)',
                borderBottom: '1px solid var(--border-color)'
              }}
            >
              <div>
                <h6 className="mb-0" style={{ color: 'var(--text-light)' }}>
                  <i className="bi bi-robot me-2"></i>
                  Componentary Assistant
                </h6>
                <small style={{ color: 'var(--text-light)', opacity: 0.8 }}>
                  Ask me anything about this page
                </small>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-sm"
                  onClick={clearChat}
                  title="Clear chat"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'var(--text-light)'
                  }}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
                <button 
                  className="btn btn-sm"
                  onClick={() => setIsOpen(false)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'var(--text-light)'
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="p-3 overflow-auto"
              style={{ 
                height: 'calc(100% - 120px)',
                backgroundColor: 'var(--darker-color)'
              }}
            >
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`mb-3 d-flex ${message.type === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div 
                    className="rounded-3 p-3 max-width-75"
                    style={{ 
                      maxWidth: '75%',
                      backgroundColor: message.type === 'user' 
                        ? 'var(--primary-color)' 
                        : 'var(--surface-bg)',
                      color: message.type === 'user' 
                        ? 'var(--text-light)' 
                        : 'var(--text-light)',
                      border: message.type === 'bot' 
                        ? '1px solid var(--border-light)' 
                        : 'none'
                    }}
                  >
                    {message.type === 'bot' && (
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-robot me-2" style={{ color: 'var(--primary-color)' }}></i>
                        <small style={{ color: 'var(--text-muted)' }}>Componentary Assistant</small>
                      </div>
                    )}
                    <div className="small">{message.content}</div>
                    <div 
                      className="mt-1" 
                      style={{ 
                        fontSize: '0.75rem',
                        color: message.type === 'user' 
                          ? 'rgba(255, 255, 255, 0.7)' 
                          : 'var(--text-muted)'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="d-flex justify-content-start mb-3">
                  <div 
                    className="rounded-3 p-3"
                    style={{
                      backgroundColor: 'var(--surface-bg)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-robot me-2" style={{ color: 'var(--primary-color)' }}></i>
                      <span 
                        className="spinner-border spinner-border-sm me-2" 
                        role="status"
                        style={{ color: 'var(--primary-color)' }}
                      ></span>
                      <small style={{ color: 'var(--text-muted)' }}>Assistant is typing...</small>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div 
              className="p-3"
              style={{ 
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)'
              }}
            >
              <form onSubmit={handleSendMessage} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ask me anything about this page..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'var(--darker-color)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-light)',
                    '::placeholder': {
                      color: 'var(--text-muted)'
                    }
                  }}
                />
                <button 
                  type="submit" 
                  className="btn btn-sm"
                  disabled={!inputMessage.trim() || isLoading}
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    border: 'none',
                    color: 'var(--text-light)'
                  }}
                >
                  <i className="bi bi-send"></i>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Chat toggle button */}
        <button 
          className={`btn rounded-circle shadow-lg website-helper-button ${isOpen ? 'd-none' : ''}`}
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '60px', 
            height: '60px',
            fontSize: '1.5rem',
            backgroundColor: 'var(--primary-color)',
            border: 'none',
            color: 'var(--text-light)',
            boxShadow: '0 4px 20px rgba(215, 86, 64, 0.4)',
            transition: 'all 0.3s ease'
          }}
          title="Need help? Chat with our assistant"
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 25px rgba(215, 86, 64, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 20px rgba(215, 86, 64, 0.4)';
          }}
        >
          <i className="bi bi-robot"></i>
        </button>
      </div>
    </>
  );
};

export default WebsiteHelper;
