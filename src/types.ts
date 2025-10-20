export interface ChatMessage {
  id: string;       // Unique ID for each message
  text: string;     // The message content
  sender: 'user' | 'bot'; // To distinguish who sent it
  timestamp: string;  // To display the time
}

export interface TerminalMessage{
  id: string;
  text: string;
}