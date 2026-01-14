// src/components/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, ChatMessage, ChatWindowProps } from '../types';
import Message from './Message';
import ChatIntroPopup from './ChatIntroPopup';
// css imported globally in index.tsx



// css imported globally in index.tsx


// 2. Accept the new props (added selectedTemplate, onTemplateChange)
const ChatWindow: React.FC<ChatWindowProps & { selectedTemplate: string, onTemplateChange: (t: string) => void }> = ({ messages, setMessages, loadChat, chatPartnerName, suggestedMessage, onSend, availableTemplates = [], introText, onIntroClose, isLoading = false, selectedTemplate, onTemplateChange }) => {

  const [currentMessage, setCurrentMessage] = useState('');
  // const [selectedTemplate, setSelectedTemplate] = useState('template_one'); // Lifted to App.tsx
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom logic
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (suggestedMessage && suggestedMessage !== "") {
      setCurrentMessage(suggestedMessage);
    } else {
      // if suggested is empty, we don't necessarily clear it, or do we?
      // The user might be typing? 
      // But usually we clear after send.
      // If suggestedMessage is cleared by parent, we might clear here?
      // Let's assume parent clears it after send.
    }
  }, [suggestedMessage]);




  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const text = currentMessage.trim();
    if (text === '') return;

    // Call parent handler
    if (onSend) {
      onSend(text);
    }

    setCurrentMessage('');
  };

  return (
    <div className="chat-container" style={{ position: 'relative' }}>
      {introText && onIntroClose && (
        <ChatIntroPopup
          title={chatPartnerName}
          content={introText}
          onClose={onIntroClose}
        />
      )}
      <div className="chat-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="https://via.placeholder.com/40" alt="avatar" className="avatar" />
          <div className="contact-info">
            <h3>{chatPartnerName}</h3>
            <p>online</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={selectedTemplate}
            onChange={(e) => onTemplateChange(e.target.value)}
            style={{
              padding: '4px',
              fontSize: '0.8rem',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.3)',
              color: 'inherit'
            }}
          >
            {availableTemplates.map(t => (
              <option key={t} value={t} style={{ color: 'black' }}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={() => loadChat(selectedTemplate, true)}
            style={{
              padding: '4px 12px',
              fontSize: '0.8rem',
              color: 'inherit',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid currentColor',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Load
          </button>
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