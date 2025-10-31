// This defines chat message
export interface ChatMessage {
  id: string;       // Unique ID for each message
  text: string;     // The message content
  sender: 'user' | 'bot'; // To distinguish who sent it
  timestamp: string;  // To display the time
}

// this defines one analysis prediction
export interface AnalysisPrediction {
  label: string;
  score: number;
  color: string;
}

// this defines entire analysis object
export interface AnalysisResult {
  summary: string;
  predictions:AnalysisPrediction[];
}