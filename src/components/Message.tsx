// src/components/Message.tsx

import React from 'react';
import { ChatMessage } from '../types';
import '../styles/Chat.css';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  // Determine the class name based on the sender
  const messageClass = message.role === 'user' ? 'message user' : 'message bot';

  return (
    <div className={messageClass}>
      <div className="message-content">
        {message.content}
      </div>
      <div className="message-timestamp">
        {message.timestamp}
      </div>
    </div>
  );
};

export default Message;