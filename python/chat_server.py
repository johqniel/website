from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from llama_cpp import Llama
from pathlib import Path


import os
import random

import json
import requests  # 1. We need this to call the other server
import atexit    # 2. We need this to clean up the analysis file

# --- File Paths ---
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "output_data"
TEMPLATE_DIR = SCRIPT_DIR.parent / "chat_templates"
REACT_BUILD_DIR = SCRIPT_DIR.parent / "build"

# --- Load LLM ---
print("Loading Llama 3.2 model...")
llm = Llama(
    model_path="models/unsloth.Q4_K_M.gguf",
    verbose=False,
    n_ctx=4096, # Make sure n_ctx is set
    chat_format="llama-3" # Make sure chat_format is set
)
print("Model loaded successfully.")

app = Flask(__name__, static_folder=str(REACT_BUILD_DIR), static_url_path='/')

CORS(app)




os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMPLATE_DIR, exist_ok=True)

# --- Load Chat History ---
def load_messages(chat_file_path):
    if chat_file_path.exists():
        try:
            with open(chat_file_path, "r") as f:
                return json.load(f)
        except Exception:
            return [{"role": "system", "content": "You are the users best friend. Try to act as human as possible."}]
    return [{"role": "system", "content": "You are the users best friend. Try to act as human as possible."}]


# --- Load Last Known Analysis ---
def get_last_analysis(analysis_file_path):
    if analysis_file_path.exists():
        try:
            with open(analysis_file_path, "r") as f:
                return json.load(f)
        except Exception:
            return None
    return None

# --- Get a chat history ---
@app.route("/api/get-chat", methods=["GET"])
def get_chat():
    session_id: str = request.args.get("session_id")
    template_name = request.args.get("template")
    new_template_loaded = False

    file_path_to_load = None
    analysis_file_path = None # Initialize as None
    
    # --- We MUST have a session_id, no matter what ---
    if not session_id:
        return jsonify({"error": "No session_id provided"}), 400
    


    # Make the session_id safe
    safe_session_id = Path(session_id).name
    user_file_path = OUTPUT_DIR / session_id
    user_file_path.mkdir(parents=True,exist_ok=True)
    num_users_sessions = len([f for f in user_file_path.iterdir() if f.is_file()])

    
    if template_name:
        new_template_loaded = True
        
        # Get a list of all files in the folder
        files = [f for f in TEMPLATE_DIR.iterdir() if f.is_file()]

        # --- FIX FOR EMPTY TEMPLATE FOLDER ---
        if not files:
            print(f"Error: No templates found in {TEMPLATE_DIR}")
            return jsonify({"error": "No templates found"}), 404
        
        random_file = random.choice(files)
        file_path_to_load = random_file
        
        # Templates don't have analysis files, so we set this to None
        analysis_file_path = None
        
    else: # No template, just load the most recent user's chat
        files = sorted([f for f in user_file_path.iterdir() if f.is_file()])
        file_path_to_load = files[len(files)-1] # load most recent chat

        #file_path_to_load = OUTPUT_DIR / f"{safe_session_id}_messages.json"
        #analysis_file_path = OUTPUT_DIR / f"{safe_session_id}_analysis.json"

    # Load the chat history
    chat_history = load_messages(file_path_to_load)

    # If we loaded a template, save it as the new chat for this session
    if new_template_loaded:
        path_to_save = OUTPUT_DIR / safe_session_id / f"{safe_session_id}_{num_users_sessions + 1}.json"
        with open(path_to_save, "w") as f:
            json.dump(chat_history, f, indent=4)
        
        # Also clear the old analysis file for this user
        old_analysis_file = OUTPUT_DIR / f"{safe_session_id}_analysis.json"
        if old_analysis_file.exists():
            os.remove(old_analysis_file)

    # Load the analysis data (if it exists)
    analysis_data = None
    if analysis_file_path:
        analysis_data = get_last_analysis(analysis_file_path)

    return jsonify({
        "chatHistory": chat_history,
        "analysisHistory": analysis_data
    })


@app.route("/api/chat", methods=["POST"])
def handle_chat():
    data = request.json
    user_message = data.get("content")
    session_id = data.get("session_id")

    if not session_id:
        return jsonify({"error": "No session_id provided"}), 400
    
    # create safe session id:
    safe_session_id = Path(session_id).name




    # Create User specific file paths
    users_file_path = OUTPUT_DIR / safe_session_id
    users_file_path.mkdir(parents=True,exist_ok=True)
    num_users_sessions = len([f for f in users_file_path.iterdir() if f.is_file()])
    newest_chat_path = users_file_path / f"{session_id}_{num_users_sessions}.json"
    #
    analysis_file_path = OUTPUT_DIR / f"{session_id}_analysis.json"

    # Load users history:
    messages_for_llm = load_messages(newest_chat_path)

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    messages_for_llm.append({'role': 'user', 'content': user_message})


    try:
        print("Len of messages sent to llm: ", len(messages_for_llm))
        print("Last message recieved: ", messages_for_llm[-1])
        # --- 1. Call LLM (FAST) ---
        chat_completion = llm.create_chat_completion(
            messages=messages_for_llm,
            stop=["<|eot_id|>"]
        )
        bot_response = chat_completion['choices'][0]['message']['content']
        print("Bot response: ", bot_response)
        messages_for_llm.append({'role': 'assistant', 'content': bot_response})
        #print(messages_for_llm)
        #print("Check trigger")
        # trigger analysis server
        print("Len of messages is: ", len(messages_for_llm))
        if len(messages_for_llm) >= 4 and (len(messages_for_llm) - 4) % 3 == 0 :
            try:
                print("requested analysis")
                
                # send session id and chat history to analyse server
                requests.post(
                    "http://localhost:8001/analyze",
                    json={
                        "chat_history": messages_for_llm,
                        "session_id": session_id
                    },
                    timeout = 1
                )
            except requests.exceptions.ReadTimeout:
                # This is *expected*. We just want to start the job.
                print("Chat server: Analysis job started (ReadTimeout).")
            except requests.exceptions.ConnectionError as e:
                # THIS IS THE LIKELY ERROR
                print(f"!!! CHAT SERVER FAILED TO CONNECT TO ANALYSIS SERVER !!!")
                print(f"Error: {e}")
            except Exception as e:
                # Catch any other errors
                print(f"Chat server: Failed to trigger analysis for an unknown reason: {e}")

        # save users chat file:
        safe_file_path = users_file_path / f"{safe_session_id}_{num_users_sessions + 1}.json"
        with open(safe_file_path, "w") as f:
            json.dump(messages_for_llm,f,indent=4)
        
        # get users analysis: 
        current_analysis = None
        if analysis_file_path.exists():
            current_analysis = get_last_analysis(analysis_file_path)
            os.remove(analysis_file_path)
        

        return jsonify({
            "response": bot_response,
            "analysis": current_analysis
        })
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return jsonify({"error": "Error processing LLM response"}), 500
    

# Set the path to the React build folder

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    # This logic is simpler and more robust:
    # 1. Try to find a specific file (like 'static/js/main.js')
    if path != "" and (Path(app.static_folder) / path).exists():
        return send_from_directory(app.static_folder, path)
    # 2. If no file is found, just send the main 'index.html'
    #    This lets React handle the routing.
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    print("Starting Chat Server on http://localhost:8000")
    app.run(debug=False, port=8000, host = '0.0.0.0') # Run in non-debug mode to avoid clashes