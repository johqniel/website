// src/components/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import '../styles/Chat.css';

// 1. Define the props it now receives from App.tsx
interface ChatWindowProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addTerminalMessage: (text: string) => void; // Function to add "thoughts"
}

// 2. Accept the new props
const ChatWindow: React.FC<ChatWindowProps> = ({ messages, setMessages, addTerminalMessage }) => {
  
  // 3. REMOVE the old `messages` state
  // const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

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
    const text = currentMessage.trim();
    if (text === '') return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: text,
      sender: 'user',
      timestamp: getTimestamp(),
    };
    
    // This `setMessages` function now updates the state in App.tsx
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    // 4. *** THIS IS THE NEW PART ***
    // When you send a message, also send a "thought" to the terminal
    // In the future, you'll get this text from your 2nd LLM
    addTerminalMessage(`User input detected: "${text}". Analyzing intent...`);
    
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
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
        text: data.response,
        sender: 'bot',
        timestamp: getTimestamp(),
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (error) {
      // 6. *** ADD AN ERROR "THOUGHT" ***
      addTerminalMessage(`Error occurred. API call failed. Details: ${error}`);

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

  // The rest of your JSX (return statement) remains exactly the same!
  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src="https://via.placeholder.com/40" alt="avatar" className="avatar" />
        <div className="contact-info">
          <h3>Jonathan (Best-friend)</h3>
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