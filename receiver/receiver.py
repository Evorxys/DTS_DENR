from flask import Flask, request, jsonify, render_template, send_from_directory
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(
    __name__,
    template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
    static_folder=os.path.join(os.path.dirname(__file__), 'static')
)

# Folder to save uploaded files in the file_server directory
FILE_SERVER_FOLDER = os.path.join(os.path.dirname(__file__), 'file_server')
os.makedirs(FILE_SERVER_FOLDER, exist_ok=True)

# Load environment variables
SECURE_KEY = os.getenv('SECRET_KEY')

# Route to handle file reception
@app.route('/receive', methods=['POST'])
def receive_file():
    auth_key = request.headers.get('Authorization')
    print(f"Received Authorization header: {auth_key}")  # Debug print statement
    print(f"Expected Authorization header: Bearer {SECURE_KEY}")  # Debug print statement
    if auth_key != f'Bearer {SECURE_KEY}':
        return jsonify({'error': 'Unauthorized'}), 401

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file.save(os.path.join(FILE_SERVER_FOLDER, file.filename))
    return jsonify({'message': 'File received successfully'}), 200

@app.route('/')
def index():
    return render_template('receiver.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)