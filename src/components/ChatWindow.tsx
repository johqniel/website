// src/components/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, ChatMessage, ChatWindowProps } from '../types';
import Message from './Message';
import '../styles/Chat.css';


const API_URL = process.env.REACT_APP_API_URL;


// 2. Accept the new props
const ChatWindow: React.FC<ChatWindowProps> = ({ messages, setMessages, updateAnalysis }) => {
  
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  // get sessionId
  const getSessionId = () => {
    return localStorage.getItem('chat_session_id');
  }


  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]); // This still works, as it now watches the `messages` prop

  const getTimestamp = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const sessionId = getSessionId();
    if (!sessionId) {
      console.error("Session ID not set");
      return;
    }


    const text = currentMessage.trim();
    if (text === '') return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: text,
      role: 'user',
      timestamp: getTimestamp(),
    };
    
    // This `setMessages` function now updates the state in App.tsx
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

  
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: text,
          session_id: sessionId 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      //const botResponseText = data.response; // Adjust this based on your API

      // 5. *** ADD ANOTHER "THOUGHT" ***
      //addTerminalMessage(`LLM-1 generated response: "${botResponseText.substring(0, 20)}...".`);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        content: data.response,
        role: 'bot',
        timestamp: getTimestamp(),
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      if (data.analysis) {
        updateAnalysis(data.analysis);
      }

    } catch (error) {
      // 6. *** ADD AN ERROR analysis ***
      console.error('Error occurred: ', error);

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I ran into an error. Please try again.',
        role: 'bot',
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
          <h3>Your best friend </h3>
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
          &#x27A4;
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;