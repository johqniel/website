from flask import Flask, request, jsonify
import json
import os
import base64
import time
import vercel_blob

app = Flask(__name__)

@app.route('/api/save_template', methods=['POST'])
def save_template():
    """
    Endpoint to save chat templates and their avatars to Vercel Blob.
    
    Expects JSON payload with:
    - name: str
    - systemPrompt: str
    - introText: str
    - avatar: str (Base64 encoded image or null)
    - messages: list
    
    Process:
    1. Uploads Avatar PNG (if present) to Vercel Blob.
    2. Updates 'avatar' field with the new public URL.
    3. Uploads the final JSON to Vercel Blob.
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Create a unique timestamp/id for filenames
        timestamp = int(time.time())
        sanitized_name = "".join(x for x in data.get('name', 'template') if x.isalnum())
        file_id = f"{sanitized_name}-{timestamp}"

        # 1. Handle Avatar Upload
        avatar_base64 = data.get('avatar')
        if avatar_base64 and avatar_base64.startswith('data:image'):
            try:
                # Extract actual base64 data (remove "data:image/png;base64,")
                header, encoded = avatar_base64.split(",", 1)
                image_data = base64.b64decode(encoded)
                
                # Upload to Blob
                filename = f"avatars/{file_id}.png"
                blob = vercel_blob.put(filename, image_data, options={'access': 'public'})
                
                # Update data with the new public URL
                data['avatar'] = blob['url']
                print(f"Uploaded avatar to: {blob['url']}")
            except Exception as e:
                print(f"Error uploading avatar: {e}")
                # Don't fail the whole request, just keep the base64 or set null
                # But better to just log it for now.

        # 2. Upload Template JSON
        json_filename = f"templates/{file_id}.json"
        json_content = json.dumps(data, indent=2)
        
        json_blob = vercel_blob.put(json_filename, json_content.encode('utf-8'), options={'access': 'public'})
        print(f"Uploaded template to: {json_blob['url']}")

        return jsonify({
            "status": "success",
            "message": "Template saved successfully!",
            "templateUrl": json_blob['url'],
            "avatarUrl": data.get('avatar')
        }), 200

    except Exception as e:
        print(f"Error saving template: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
