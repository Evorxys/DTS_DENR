import smtplib
import random
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Function to generate OTP
def generate_otp(length=6):
    otp = ''.join(random.choices(string.digits, k=length))
    return otp

# Function to send OTP via email
def send_otp_email(to_email, otp):
    sender_email = "jay.lord.diniega1@gmail.com"
    sender_password = "wowd wgpo rojn jozw"

    # Set up the email server (SMTP)
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    # Set up the message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = "Your OTP Code"

    # OTP body
    body = f"Your OTP code is {otp}"
    msg.attach(MIMEText(body, 'plain'))

    # Connect to the SMTP server and send the email
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Secure the connection
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, to_email, text)
        print("OTP sent successfully")
    except Exception as e:
        print(f"Failed to send OTP: {e}")
    finally:
        server.quit()

# Main function
if __name__ == "__main__":
    # Generate OTP
    otp = generate_otp()
    # Email address to send OTP
    to_email = "frozenheart512002@gmail.com"
    
    # Send OTP to the email
    send_otp_email(to_email, otp)