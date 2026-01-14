// This defines chat message
export interface ChatMessage {
  id: string;       // Unique ID for each message
  content: string;     // The message content
  role: 'user' | 'bot'; // To distinguish who sent it
  timestamp: string;  // To display the time
}

// this defines one analysis prediction
export interface AnalysisPrediction {
  label: string;
  score: number;
  risk_level?: string;
  color: string;
}

// this defines entire analysis object
export interface AnalysisResult {
  summary: string;
  predictions: AnalysisPrediction[];
}

export interface ChatTemplate {
  name: string;
  introText?: string;
  messages: { role: string; content: string }[];
  analysis: AnalysisResult;
}

export interface ChatWindowProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  updateAnalysis: (result: AnalysisResult) => void;
  loadChat: (id: string | null, isTemplate?: boolean) => void;
  chatPartnerName: string;
  suggestedMessage?: string;
  onSend?: (message: string) => void;
  availableTemplates?: string[];
  introText?: string | null;
  onIntroClose?: () => void;
  isLoading?: boolean;
}