from flask import Flask, request, jsonify, render_template
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='static')

# Temporary folder for uploaded files
UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Environment variables
LOCAL_SERVER_IP = os.getenv('LOCAL_SERVER_IP')
LOCAL_SERVER_PORT = os.getenv('LOCAL_SERVER_PORT')
SECURE_KEY = os.getenv('SECURE_KEY')

# Home route
@app.route('/')
def index():
    return render_template('upload.html')

# File upload route
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save file temporarily
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Forward file to local server or cloud storage
    try:
        #print(f"Sending request with SECURE_KEY: {SECURE_KEY}")  # Debug print statement
        with open(file_path, 'rb') as f:
            response = requests.post(
                f"https://{LOCAL_SERVER_IP}:{LOCAL_SERVER_PORT}/receive",
                files={'file': f},
                headers={'Authorization': f'Bearer {SECURE_KEY}'}
            )
        if response.status_code == 200:
            return jsonify({'message': 'File uploaded successfully'}), 200
        else:
            return jsonify({'error': f'Failed to forward file: {response.status_code}, {response.text}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
