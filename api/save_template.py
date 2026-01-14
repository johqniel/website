from flask import Flask, request, jsonify
import json
import sys
import os

# Add the current directory to sys.path to import config if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)

@app.route('/api/save_template', methods=['POST'])
@app.route('/save_template', methods=['POST']) # Fallback
def save_template():
    """
    Endpoint to receive and "save" chat templates.
    Currently, this just logs the template data to the console, 
    effectively storing it in Vercel Function Logs.
    
    To upgrade to Vercel KV (Redis):
    1. pip install vercel-kv-sdk
    2. Import KV client
    3. kv.set(f"template:{data['name']}", json.dumps(data))
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        # Log the received data. This will show up in Vercel Runtime Logs.
        print("--- NEW TEMPLATE SUBMISSION ---")
        print(json.dumps(data, indent=2))
        print("-------------------------------")
        
        return jsonify({
            "status": "success",
            "message": "Template submitted successfully (logged)."
        }), 200

    except Exception as e:
        print(f"Error saving template: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
