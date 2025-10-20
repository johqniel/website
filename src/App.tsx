// src/App.tsx

import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import TerminalWindow from './components/TerminalWindow';
import { ChatMessage, TerminalMessage } from './types';
import './styles/AppLayout.css'; // Import new layout CSS

function App() {
  // State for both windows now lives here
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessage[]>([]);

  // This function will be passed to ChatWindow
  // ChatWindow can call this to add a new "thought" to the terminal
  const addTerminalMessage = (text: string) => {
    const newTerminalMessage: TerminalMessage = {
      id: `term-${Date.now()}`,
      text: text,
    };
    // Add the new message to the list
    setTerminalMessages((prevMessages) => [...prevMessages, newTerminalMessage]);
  };

  return (
    // Use the new main-layout class
    <div className="main-layout">
      
      {/* Column 1: Chat */}
      <div className="chat-column">
        <ChatWindow 
          // Pass the state and functions down as props
          messages={chatMessages}
          setMessages={setChatMessages}
          addTerminalMessage={addTerminalMessage} 
        />
      </div>
      
      {/* Column 2: Terminal */}
      <div className="terminal-column">
        <TerminalWindow messages={terminalMessages} />
      </div>

    </div>
  );
}

export default App;