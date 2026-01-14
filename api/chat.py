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
# Initialize OpenAI client variable
client = None

def get_openai_client():
    global client
    if not client:
        # Check for key before initializing
        if not Config.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
        client = OpenAI(api_key=Config.OPENAI_API_KEY)
    return client

@app.route('/api/health', methods=['GET'])
@app.route('/health', methods=['GET'])  # Fallback
def health_check():
    return jsonify({"status": "ok", "version": "1.0"}), 200

@app.route('/api/chat', methods=['POST'])
@app.route('/chat', methods=['POST'])  # Fallback
def chat():
    if not Config.OPENAI_API_KEY:
        return jsonify({"error": "OpenAI API key not configured"}), 500

    try:
        data = request.json
        print(f"Chat Request path: {request.path}") # LOG PATH
        messages = data.get('messages', [])

        if not messages:
            return jsonify({"error": "No messages provided"}), 400

        # Check for dynamic system prompt
        system_prompt = data.get('system_prompt', Config.SYSTEM_PROMPT)

        # Construct the full message history starting with the system prompt
        full_conversation = [
            {"role": "system", "content": system_prompt}
        ] + messages

        # Call OpenAI API for Chat Response
        try:
            current_client = get_openai_client()
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 500

        chat_response = current_client.chat.completions.create(
            model=Config.CHAT_MODEL,
            messages=full_conversation
        )

        assistant_message_content = chat_response.choices[0].message.content

        return jsonify({
            "role": "assistant",
            "content": assistant_message_content
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Analyze route removed. Use api/analyze.py

# Vercel requires the app to be available as 'app'
if __name__ == '__main__':
    app.run(debug=True, port=5000)
