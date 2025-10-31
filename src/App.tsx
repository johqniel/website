// src/App.tsx

import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import TerminalWindow from './components/TerminalWindow';
import { ChatMessage, AnalysisResult } from './types';
import './styles/AppLayout.css'; // Import new layout CSS

function App() {
  // State for chat window 
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // State for analysis result
  const [analysisResult,setAnalysisResult] = useState<AnalysisResult | null>(null);



    // pass new analysis to terminalwindow.
  const updateAnalysis = (result: AnalysisResult) => {
      setAnalysisResult(result);
    };
    return (
      <div className="main-layout">
        <div className="chat-column">
          <ChatWindow 
            messages={chatMessages}
            setMessages={setChatMessages}
            updateAnalysis={updateAnalysis} // <-- Pass the new function
          />
        </div>
        
        <div className="terminal-column">
          {/* Pass the new state object */}
          <TerminalWindow analysis={analysisResult} />
        </div>
      </div>
    );
  }

export default App;