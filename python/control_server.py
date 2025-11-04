from flask import Flask, request, jsonify
from transformers import pipeline
from pathlib import Path
import os
import json

# --- 1. Load Models (SLOW) ---
print("Loading summarizer model...")
summarizer = pipeline("summarization", model="lidiya/bart-large-xsum-samsum")
print("Loading classifier model...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("Analysis models loaded.")

app = Flask(__name__)


# --- 2. File Path ---
# This server just needs to know where to save the *result*
OUTPUT_DIR = Path(__file__).parent.parent / "output_data"

candidate_labels = ["criminal activity", "fraud", "casual chat", "flirt", "political crime", "hatespeech"]
color_labels = {
    "criminal activity": "#F31905", # Red
    "fraud": "#FBB904",             # Yellow/Orange
    "casual chat": "#34A853",       # Green
    "flirt": "#297F3F",             # Pink
    "political crime": "#E20606",    # Dark Red
    "hatespeech": "#E9AC10"         # Black
}
# --- 3. Helper Function (Copied from other file) ---
def format_chat_as_string(chat_history, speaker_1="Max", speaker_2="Moritz"):
    history_to_analyze = [msg for msg in chat_history if msg['role'] != 'system']
    chat_string = ""
    for msg in history_to_analyze:
        speaker = "Unknown"
        if msg.get('role') == 'user': speaker = speaker_1
        elif msg.get('role') == 'assistant': speaker = speaker_2
        content = msg.get('content', '')
        chat_string += f"{speaker}: {content}\n"
    return chat_string.strip()

# --- 4. The Analysis Endpoint ---
@app.route("/analyze", methods=["POST"])
def do_analysis():
    data = request.json
    chat_history = data.get("chat_history")
    session_id = data.get("session_id")

    print("New analysis \n \n \n")

    if not session_id:
        return jsonify({"error": "No session_id provided"}), 400
    
    analysis_file_path = OUTPUT_DIR / f"{session_id}_analysis.json"


    if not chat_history:
        return jsonify({"error": "No chat history provided"}), 400

    print(f"Analysis: Received job for session {session_id}")
    
    try:
        chat_string = format_chat_as_string(chat_history)

        
        # --- 5. Run Models (SLOW) ---
        summary = summarizer(chat_string)[0]['summary_text']
        analysis = classifier(summary, candidate_labels)


        # Build the list of predictions
        predictions = []
        for label, score in zip(analysis['labels'], analysis['scores']):
            predictions.append({
                "label": label,
                "score": score,
                "color": color_labels.get(label, "#666666") # Default to gray
            })

        analysis['labels'] = color_labels

        # This is the final object we will send
        final_json_output = {
            "summary": summary,
            "predictions": predictions # This list is already sorted by score
        }

        # --- 4. Save and return the full JSON ---
        with open(analysis_file_path, "w") as f:
            json.dump(final_json_output, f, indent=4)
            
        return jsonify({"status": "success"})

    except Exception as e:
        print(f"Analysis failed: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting Analysis Server on http://localhost:8001")
    app.run(debug=False, port=8001, host='0.0.0.0') # Run on a different port