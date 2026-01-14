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
    ANALYSIS_SYSTEM_PROMPT = """Du bist ein Experte für die Überwachung und Analyse von Kommunikationsmustern.
    Deine Aufgabe ist es, den Gesprächsverlauf zu analysieren und eine JSON-Ausgabe auf Deutsch bereitzustellen.
    
    Regeln für die Ausgabe:
    1. Bestimme für jede Vorhersage ein 'risk_level': "neutral", "auffällig", oder "sehr auffällig".
    2. Wähle die 'color' basierend auf dem 'risk_level':
       - "neutral" -> "#27c93f" (grün)
       - "auffällig" -> "#ffbd2e" (gelb)
       - "sehr auffällig" -> "#ff5f56" (rot)

    Das JSON muss strikt dieser Struktur folgen:
    {
      "summary": "Eine prägnante Zusammenfassung der Gesprächsdynamik und des Inhalts auf Deutsch. Beschreibe ob Gefahr besteht.",
      "predictions": [
        {
          "label": "Kategorie (z.B. 'Politischer Extremismus', 'Alltag', 'Betrug', 'Drogenhandel')",
          "risk_level": "neutral" | "auffällig" | "sehr auffällig",
          "color": "Hex-Farbcode"
        }
      ]
    }
    Gib bis zu 4 Vorhersagen an.
    """
