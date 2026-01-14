// src/App.tsx

import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import TerminalWindow from './components/TerminalWindow';
import CanvasBackground from './components/CanvasBackground';
import LandingSection from './components/LandingSection';
import InfoSection from './components/InfoSection';
import { ChatMessage, AnalysisResult } from './types';
import siteConfig from './siteConfig.json';
// CSS imports are now handled in index.tsx, but we rely on classes defined there.

import templates from './data/templates';
import { mockAnalysis } from './data/analysis_mock';


function App() {
  // Theme State
  const [activeTheme, setActiveTheme] = useState<'premium' | 'retro' | 'hybrid'>(siteConfig.activeTheme as 'premium' | 'retro' | 'hybrid');
  // @ts-ignore
  const themeConfig = siteConfig.themes[activeTheme];

  // Dynamic Name (overrides theme name if present from template)
  const [dynamicName, setDynamicName] = useState<string | null>(null);

  // State for chat window 
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // State for analysis result
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // State to force re-render of terminal (replay animation)
  const [terminalKey, setTerminalKey] = useState(0);

  // State for currently selected template
  const [selectedTemplate, setSelectedTemplate] = useState('template_one');

  // State for suggested message (pre-typed)
  const [suggestedMessage, setSuggestedMessage] = useState<string>("");

  // Keep track of remaining messages in the current template to simulate a flow
  const [remainingTemplateMessages, setRemainingTemplateMessages] = useState<any[]>([]);

  // State for popups
  const [introText, setIntroText] = useState<string | null>(null);

  // Counter for bot responses in this session (trigger analysis on 2, 5, 8...)
  const botResponseCountRef = React.useRef(0);

  // Loading state for API
  const [isAiLoading, setIsAiLoading] = useState(false);

  // function to load chat history from local templates
  const loadChatHistory = (id: string | null, isTemplate: boolean = false) => {
    const templateKey = id || "example";
    const template = templates[templateKey] || templates["example"];

    if (template) {
      if (template.name) {
        setDynamicName(template.name);
      }

      // Reset bot response count for new session
      if (isTemplate) {
        botResponseCountRef.current = 0;
      }

      // Set intro text if available
      setIntroText(template.introText || null);

      const allMessages = template.messages || [];
      // Start at 50%
      let cutoff = Math.floor(allMessages.length / 2);

      // Ensure we stop AT a user message (so we can suggest it)
      // If the message at cutoff is 'assistant', include it in history and move forward
      while (cutoff < allMessages.length && allMessages[cutoff].role !== 'user') {
        cutoff++;
      }

      const loadedMessages = allMessages.slice(0, cutoff).map((msg: any, idx: number) => ({
        id: `msg-${Date.now()}-${idx}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toLocaleTimeString()
      }));

      setChatMessages(loadedMessages);

      // The next one is likely a user message (or we hit end)
      const remaining = allMessages.slice(cutoff);

      if (remaining.length > 0 && remaining[0].role === 'user') {
        setSuggestedMessage(remaining[0].content);
        // The remaining queue starts AFTER this user message
        setRemainingTemplateMessages(remaining.slice(1));
      } else {
        // If we hit end or it's weird, just empty
        setSuggestedMessage("");
        setRemainingTemplateMessages([]);
        // If there are remaining bot messages because we ran off end? (Unlikely due to loop)
        if (remaining.length > 0) {
          // In API mode, we might just ignore them or suggest the first user message?
          // For now, let's just do nothing.
        }
      }

      setAnalysisResult(template.analysis || mockAnalysis);
      // Force terminal update
      setTerminalKey(prev => prev + 1);
    }
  };

  const handleUserMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      content: text,
      role: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    // Add user message immediately
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);

    // Force terminal update
    // setTerminalKey(prev => prev + 1); // REMOVED: Only update on actual analysis

    // Clear suggestion
    setSuggestedMessage("");
    setRemainingTemplateMessages([]); // Stop any template playback

    // Call Backend
    setIsAiLoading(true);
    try {
      // Prepare messages for API (map internal format to needed format)
      // We look at ALL visible messages as history
      const apiMessages = updatedMessages.map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          system_prompt: (templates[selectedTemplate as keyof typeof templates] as any)?.systemPrompt
        })
      });

      if (!response.ok) {
        let errorText = 'API Error';
        try {
          const errData = await response.json();
          errorText = errData.error || `HTTP ${response.status}`;
        } catch (e) {
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        throw new Error(errorText);
      }

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        content: data.content,
        role: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };

      setChatMessages(prev => [...prev, botMsg]);
      setIsAiLoading(false); // Chat is done loading

      // Increment count
      botResponseCountRef.current += 1;
      const currentCount = botResponseCountRef.current;

      const shouldAnalyze = (currentCount >= 2) && ((currentCount - 2) % 3 === 0);

      // --- Separate Analysis Step ---
      if (shouldAnalyze) {
        try {
          // Construct history for analysis: all previous + botMsg
          // We filter out system prompt handling here as backend does it
          const analysisHistory = [...apiMessages, { role: 'assistant', content: botMsg.content }];

          const analysisResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: analysisHistory
            })
          });

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            if (analysisData.analysis) {
              setAnalysisResult(analysisData.analysis);
              // Force terminal update only when analysis arrives
              setTerminalKey(prev => prev + 1);
            }
          }
        } catch (analysisErr) {
          console.error("Analysis failed", analysisErr);
          // We don't fail the whole chat if analysis fails, just log it
        }
      }

    } catch (error: any) {
      console.error("Failed to fetch chat response", error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        content: `Error: ${error.message || "Could not connect to analysis backend."}`,
        role: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      // setIsAiLoading(false); // Handled inside logic now to support staged loading
      if (isAiLoading) setIsAiLoading(false);
    }
  };

  // --- Load the user's chat when the app first starts ---
  useEffect(() => {
    // Load default example on start
    loadChatHistory("example", true);
  }, []);

  // pass new analysis to terminalwindow.
  const updateAnalysis = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  // Switch theme handler
  const toggleTheme = () => {
    setActiveTheme(prev => {
      if (prev === 'premium') return 'hybrid';
      return 'premium';
    });
  };

  // Get current config
  // themeConfig is defined at top now
  const themeClasses = `App ${themeConfig.styles.layout} ${themeConfig.styles.chat} ${themeConfig.styles.terminal}`;

  return (
    <div className={themeClasses} style={{ position: 'relative' }}>



      <CanvasBackground theme={activeTheme} />
      <LandingSection themeConfig={themeConfig} activeTheme={activeTheme} />

      {/* Absolute Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '8px 16px',
          borderRadius: '20px',
          background: activeTheme === 'premium' ? 'rgba(255,255,255,0.1)' : '#00AAAA',
          color: activeTheme === 'premium' ? 'white' : 'black',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          fontFamily: activeTheme === 'premium' ? 'Inter' : 'Courier New',
          fontWeight: 'bold',
          border: activeTheme === 'premium' ? '1px solid rgba(255,255,255,0.2)' : '2px solid black'
        }}
      >
        {activeTheme === 'premium' ? 'Aktivistische Seite' : 'Corporate Seite'}
      </button>

      <div id="app-content" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <div className="main-layout">
          {/* Chat Selector moved to ChatWindow Header */}

          <div className="chat-column">
            <ChatWindow
              messages={chatMessages}
              setMessages={setChatMessages}
              updateAnalysis={updateAnalysis}
              loadChat={loadChatHistory}
              // @ts-ignore
              chatPartnerName={dynamicName || themeConfig.chatPartnerName || "AI Assistant"}
              suggestedMessage={suggestedMessage}
              onSend={handleUserMessage}
              availableTemplates={Object.keys(templates).filter(k => k !== 'example')}
              introText={introText}
              onIntroClose={() => setIntroText(null)}
              isLoading={isAiLoading}
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
            />
          </div>

          <div className="terminal-column">
            {/* Pass the new state object and key to force reset */}
            <TerminalWindow key={terminalKey} analysis={analysisResult} />
          </div>
        </div>

        {/* Info Section positioned below the main interaction area */}
        <InfoSection
          themeConfig={themeConfig}
          sharedLinks={activeTheme !== 'premium' ? (siteConfig as any).sharedLinks : []}
        />
      </div>
    </div >
  );
}

export default App;