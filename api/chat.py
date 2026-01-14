from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os
import sys

# Load environment variables
load_dotenv()

# Add the current directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from config import Config
except ImportError:
    # Fallback if running from root
    from api.config import Config

app = Flask(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=Config.OPENAI_API_KEY)

@app.route('/api/chat', methods=['POST'])
def chat():
    if not Config.OPENAI_API_KEY:
        return jsonify({"error": "OpenAI API key not configured"}), 500

    try:
        data = request.json
        messages = data.get('messages', [])

        if not messages:
            return jsonify({"error": "No messages provided"}), 400

        # Construct the full message history starting with the system prompt
        full_conversation = [
            {"role": "system", "content": Config.SYSTEM_PROMPT}
        ] + messages

        # Call OpenAI API for Chat Response
        chat_response = client.chat.completions.create(
            model=Config.MODEL_NAME,
            messages=full_conversation
        )

        assistant_message_content = chat_response.choices[0].message.content

        # Prepare for Analysis
        # We append the assistant's new message to the history for analysis
        analysis_conversation = full_conversation + [
            {"role": "assistant", "content": assistant_message_content}
        ]

        # Add the analysis system prompt instruction
        # We replace the original system prompt with the analysis one for this specific call, 
        # or we just send the conversation to a new context.
        # Let's construct a dedicated message list for analysis to be clean.
        analysis_messages = [
            {"role": "system", "content": Config.ANALYSIS_SYSTEM_PROMPT}
        ] + [msg for msg in analysis_conversation if msg["role"] != "system"]

        # Call OpenAI API for Analysis
        analysis_response = client.chat.completions.create(
            model=Config.MODEL_NAME,
            messages=analysis_messages,
            response_format={"type": "json_object"}
        )

        analysis_content = analysis_response.choices[0].message.content
        
        import json
        try:
            analysis_json = json.loads(analysis_content)
        except json.JSONDecodeError:
            print("Failed to parse analysis JSON")
            analysis_json = None

        return jsonify({
            "role": "assistant",
            "content": assistant_message_content,
            "analysis": analysis_json
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Vercel requires the app to be available as 'app'
if __name__ == '__main__':
    app.run(debug=True, port=5000)
