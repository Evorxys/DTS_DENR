import bcrypt
import tkinter as tk
from tkinter import StringVar, ttk

def encrypt_data(input_text):
    if input_text:
        hashed_data = bcrypt.hashpw(input_text.encode('utf-8'), bcrypt.gensalt())
        return hashed_data.decode('utf-8')
    return ""

def update_encrypted_output(*args):
    input_data = user_input.get()
    encrypted_output.set(encrypt_data(input_data))

def main():
    # Create main application window
    app = tk.Tk()
    app.title("Encryption Interface")

    # Create input fields
    ttk.Label(app, text="Normal Input Box:").grid(column=0, row=0, padx=10, pady=5, sticky="W")
    normal_input = ttk.Entry(app, width=40)
    normal_input.grid(column=1, row=0, padx=10, pady=5, sticky="W")

    ttk.Label(app, text="User Input for Encryption:").grid(column=0, row=1, padx=10, pady=5, sticky="W")
    global user_input
    user_input = StringVar()
    user_input.trace("w", update_encrypted_output)
    user_input_field = ttk.Entry(app, textvariable=user_input, width=40)
    user_input_field.grid(column=1, row=1, padx=10, pady=5, sticky="W")

    ttk.Label(app, text="Encrypted Output:").grid(column=0, row=2, padx=10, pady=5, sticky="W")
    global encrypted_output
    encrypted_output = StringVar()
    encrypted_output_field = ttk.Entry(app, textvariable=encrypted_output, state="readonly", width=40)
    encrypted_output_field.grid(column=1, row=2, padx=10, pady=5, sticky="W")

    # Run the application
    app.mainloop()

if __name__ == "__main__":
    main()
