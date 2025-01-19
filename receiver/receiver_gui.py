import tkinter as tk
from tkinter import ttk, messagebox
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import threading

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Folder to save uploaded files in the file_server directory
FILE_SERVER_FOLDER = os.path.join(os.path.dirname(__file__), 'file_server')
os.makedirs(FILE_SERVER_FOLDER, exist_ok=True)

# Load environment variables
SECURE_KEY = os.getenv('SECRET_KEY')

# Route to handle file reception
@app.route('/receive', methods=['POST'])
def receive_file():
    auth_key = request.headers.get('Authorization')
    if auth_key != f'Bearer {SECURE_KEY}':
        return jsonify({'error': 'Unauthorized'}), 401

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(FILE_SERVER_FOLDER, file.filename)
    file.save(file_path)
    update_file_list(file.filename)
    return jsonify({'message': 'File received successfully'}), 200

def start_flask_app():
    app.run(host='0.0.0.0', port=5000)

def update_file_list(filename):
    file_list.insert('', 'end', values=(filename, 'Received'))

def start_server():
    threading.Thread(target=start_flask_app).start()

# Tkinter GUI
root = tk.Tk()
root.title("File Receiver")

frame = ttk.Frame(root, padding="10")
frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

file_list = ttk.Treeview(frame, columns=('Filename', 'Status'), show='headings')
file_list.heading('Filename', text='Filename')
file_list.heading('Status', text='Status')
file_list.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

scrollbar = ttk.Scrollbar(frame, orient=tk.VERTICAL, command=file_list.yview)
file_list.configure(yscroll=scrollbar.set)
scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))

start_button = ttk.Button(frame, text="Start Server", command=start_server)
start_button.grid(row=1, column=0, columnspan=2, pady=10)

root.mainloop()
