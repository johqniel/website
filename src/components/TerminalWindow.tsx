// src/components/TerminalWindow.tsx

import React, { useEffect, useRef } from 'react';
import { TerminalMessage } from '../types'; // We'll add this to types.ts
import '../styles/Terminal.css'; // We'll create this new CSS file

interface TerminalWindowProps {
  messages: TerminalMessage[];
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({ messages }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        {/* Fake terminal window bar */}
        <div className="terminal-buttons">
          <span className="terminal-dot red"></span>
          <span className="terminal-dot yellow"></span>
          <span className="terminal-dot green"></span>
        </div>
        <span>chat_kontrolle.log</span>
      </div>
      <div className="terminal-body">
        {messages.map((msg) => (
          <div key={msg.id} className="terminal-line">
            {/* The '>' prompt prefix */}
            <span className="terminal-prompt">&gt;</span>
            <span className="terminal-text">{msg.text}</span>
          </div>
        ))}
        {/* A fake blinking cursor at the end */}
        <div className="terminal-line">
          <span className="terminal-prompt">&gt;</span>
          <span className="terminal-cursor">_</span>
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default TerminalWindow;