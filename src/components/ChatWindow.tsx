// src/components/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import '../styles/Chat.css';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ref to the message list for auto-scrolling
  const messageListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to get a formatted timestamp
  const getTimestamp = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = currentMessage.trim();
    if (text === '') return;

    // 1. Add user's message to the chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: text,
      sender: 'user',
      timestamp: getTimestamp(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    // 2. Send the message to your Python backend
    try {
      // IMPORTANT: Update '/api/chat' to your actual backend endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Assume your backend returns: { "response": "Hello from the LLM!" }
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        text: data.response, // Adjust this based on your API's response
        sender: 'bot',
        timestamp: getTimestamp(),
      };

      // 3. Add the bot's response to the chat
      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally add an error message to the chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I ran into an error. Please try again.',
        sender: 'bot',
        timestamp: getTimestamp(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src="https://via.placeholder.com/40" alt="avatar" className="avatar" />
        <div className="contact-info">
          <h3>LLM Assistant</h3>
          <p>online</p>
        </div>
      </div>
      
      <div className="message-list" ref={messageListRef}>
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {/* Simple Send Icon (you can replace with an SVG) */}
          &#x27A4;
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;