// src/App.tsx

import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import TerminalWindow from './components/TerminalWindow';
import { ChatMessage, AnalysisResult } from './types';
import './styles/AppLayout.css'; // Import new layout CSS

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  // State for chat window 
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // State for analysis result
  const [analysisResult,setAnalysisResult] = useState<AnalysisResult | null>(null);

  // get users session id

  const [sessionId, setSessionId] = useState<string | null>(null)

  // create users id
  useEffect(() => {
    let currentId = localStorage.getItem('chat_session_id');
    if (!currentId) {
      // (use your safe random string generator here)
      currentId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('chat_session_id', currentId);
    }
    setSessionId(currentId);
  }, []);

  // function to load chat history from backend
  const loadChatHistory = async (id: string | null, isTemplate: boolean = false) => {
    if (!id) return; // Don't load if no ID is ready id = template id
    if (!sessionId) return; // session id = user id

    let url = "";
    if (isTemplate) {
      url = `${API_URL}/api/get-chat?template=${id}&session_id=${sessionId}`;
    } else {
      url = `${API_URL}/api/get-chat?session_id=${sessionId}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Chat history not found");
      }
      
      const data = await response.json();
      
      // Set the state with the loaded data
      setChatMessages(data.chatHistory || []);
      setAnalysisResult(data.analysisHistory || null);
      
    } catch (error) {
      console.error("Failed to load chat history:", error);
      // If it fails (like a new user), just clear the state
      setChatMessages([]);
      setAnalysisResult(null);
    }
  };

  // --- Load the user's chat when the app first starts ---
  useEffect(() => {
    // We wait until the sessionId is set
    if (sessionId) {
      loadChatHistory(sessionId, false);
    }
  }, [sessionId]); // This runs when 'sessionId' changes

    // pass new analysis to terminalwindow.
  const updateAnalysis = (result: AnalysisResult) => {
      setAnalysisResult(result);
    };
    return (
      <div className="main-layout">
        <div className="chat-selector">
          {/*}
          <button onClick={() => loadChatHistory(sessionId, false)}>
            Load My Chat
          </button>
          Commented out the button to load chat history because it makes no sense atm */}
          <button onClick={() => loadChatHistory("example", true)}>
            Load Template
          </button>
          {/* Add more template buttons here */}
        </div>
        <div className="chat-column">
          <ChatWindow 
            messages={chatMessages}
            setMessages={setChatMessages}
            updateAnalysis={updateAnalysis} 
            loadChat={loadChatHistory}
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