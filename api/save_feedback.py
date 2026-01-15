from flask import Flask, request, jsonify
import json
import time
import vercel_blob

app = Flask(__name__)

@app.route('/api/save_feedback', methods=['POST'])
def save_feedback():
    """
    Endpoint to save user feedback.
    
    Expects JSON payload with:
    - message: str
    - contact: str (optional)
    
    Process:
    1. Uploads JSON to Vercel Blob in 'feedback/' folder.
    """
    try:
        data = request.json
        if not data or not data.get('message'):
            return jsonify({"error": "No feedback message provided"}), 400

        # Create a unique timestamp/id
        timestamp = int(time.time())
        file_id = f"feedback-{timestamp}"

        # Add server-side timestamp
        data['submittedAt'] = timestamp
        
        json_filename = f"feedback/{file_id}.json"
        json_content = json.dumps(data, indent=2)
        
        # Upload as bytes
        json_blob = vercel_blob.put(json_filename, json_content.encode('utf-8'), options={'access': 'public'})
        print(f"Uploaded feedback to: {json_blob['url']}")

        return jsonify({
            "status": "success",
            "message": "Feedback saved successfully!",
            "url": json_blob['url']
        }), 200

    except Exception as e:
        print(f"Error saving feedback: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
