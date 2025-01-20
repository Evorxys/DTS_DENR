# Instructions to Start the Server and Forward Port 5000 in VSCode

## Starting the Server

1. Open a terminal in VSCode.
2. Navigate to the directory containing `receiver_gui.py`.
3. Run the following command to start the server:
    ```
    python receiver_gui.py
    ```
4. Start the server using the user interface

## Forwarding Port 5000 and Making it Public

1. In VSCode, open the Command Palette by pressing `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac).
2. Type `Remote-SSH: Forward Port from Active Host...` and select it.
3. Enter `5000` as the port number and press `Enter`.
4. Choose `Public` to make the port accessible from the internet.

Your server should now be running and accessible via port 5000.