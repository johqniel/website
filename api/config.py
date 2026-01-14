import os

class Config:
    # OpenAI API Key - ensure this is set in your Vercel project settings or .env
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    # OpenAI Model
    MODEL_NAME = "gpt-4o"

    # System Prompt - Edit this to change the AI's behavior
    SYSTEM_PROMPT = """You are a helpful and intelligent AI assistant. 
You act as a participant in a chat conversation. 
You analyze the context of the conversation and respond naturally.
"""

    # Analysis Prompt - Instructions for the separate analysis step
    ANALYSIS_SYSTEM_PROMPT = """You are an expert analyst of communication patterns.
Your task is to analyze the conversation history and provide a JSON output.
The JSON must strictly follow this structure:
{
  "summary": "A concise summary of the conversation dynamics and content.",
  "predictions": [
    {
      "label": "Name of the category (e.g., 'Political unrest', 'Phishing', 'Casual', 'Urgent')",
      "score": 0.0 to 1.0,
      "color": "Hex color code representing severity or type (e.g., #ff0000 for high risk, #00ff00 for safe)"
    }
  ]
}
Provide up to 4 predictions.
"""
