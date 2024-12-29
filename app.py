from flask import Flask, render_template, request, redirect, url_for, send_from_directory, session, flash
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import psycopg2
import os
import smtplib
import random
import string
import uuid  # Add this import for generating unique tracking numbers
from itsdangerous import URLSafeSerializer  # Add this import for URL encryption
from flask_bcrypt import Bcrypt  # Add this import for password hashing

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = 'supersecretkey'
serializer = URLSafeSerializer(app.secret_key)  # Initialize the URLSafeSerializer
bcrypt = Bcrypt(app)  # Initialize Bcrypt

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file.")
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 3600,
    'pool_timeout': 30,
    'pool_size': 10,
    'max_overflow': 20,
}

# Initialize the database
db = SQLAlchemy(app)

# Database model
class OtherUser(db.Model):
    __tablename__ = 'other_users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    gmail = db.Column(db.String(255), unique=True, nullable=False)
    position = db.Column(db.String(100))
    section_designation = db.Column(db.String(100))
    office = db.Column(db.String(100))  # Add this line
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Database model for Documents
class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    tracking_no = db.Column(db.String(50), unique=True, nullable=False)
    document_type = db.Column(db.String(100), nullable=False)
    document_properties = db.Column(db.Text)
    subject = db.Column(db.Text, nullable=False)
    date_released = db.Column(db.Date, nullable=False)
    receiving_office_section = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    document_category = db.Column(db.String(100), nullable=False)

# Database model for Admin Users
class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

def send_otp(email):
    otp = ''.join(random.choices(string.digits, k=6))
    session['otp'] = otp
    session['email'] = email

    sender_email = os.getenv('SENDER_EMAIL')
    sender_password = os.getenv('SENDER_PASSWORD')
    subject = "Your OTP Code"
    body = f"""
    <html>
    <body>
        <p>This is your OTP in Document Action Tracking System:</p>
        <p><strong style="background-color: yellow; font-size: 24px;">{otp}</strong></p>
    </body>
    </html>
    """

    message = f"Subject: {subject}\nContent-Type: text/html\n\n{body}"

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email, message)

def send_account_creation_email(email):
    sender_email = os.getenv('SENDER_EMAIL')
    sender_password = os.getenv('SENDER_PASSWORD')
    subject = "Account Created Successfully"
    body = "Your account for the Document Action Tracking System has been created successfully."

    message = f"Subject: {subject}\n\n{body}"

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email, message)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    if not username or not password:
        return 'Username and password are required', 400

    # Check if the user exists in the admin_users table
    admin_user = AdminUser.query.filter_by(username=username).first()
    if admin_user:
        try:
            if bcrypt.check_password_hash(admin_user.password, password):
                return redirect(url_for('admin_dashboard'))
        except ValueError:
            return 'Invalid password format', 400

    # Check if the user exists in the other_users table
    user = OtherUser.query.filter_by(username=username).first()
    if user:
        try:
            if bcrypt.check_password_hash(user.password, password):
                encrypted_username = serializer.dumps(username)  # Encrypt the username
                return redirect(url_for('dts', username=encrypted_username))
        except ValueError:
            return 'Invalid password format', 400

    return 'Invalid username or password', 400

@app.route('/admin_dashboard')
def admin_dashboard():
    return render_template('the_admin.html')

@app.route('/create_account', methods=['GET', 'POST'])
def create_account():
    if request.method == 'POST':
        name = request.form['name']
        position = request.form['position']
        section_designation = request.form['section']
        office = request.form['office']
        username = request.form['username']
        encrypted_password = bcrypt.generate_password_hash(request.form['password']).decode('utf-8')
        gmail = request.form['email']
        otp = request.form['otp']
        
        if not name or not position or not section_designation or not office or not username or not encrypted_password or not gmail or not otp:
            return 'All fields are required', 400
        
        # Check if the username already exists
        if OtherUser.query.filter_by(username=username).first():
            return render_template('index.html', error_message='Username already exists. Please use another username')
        
        # Check if the user already exists
        if OtherUser.query.filter_by(gmail=gmail).first():
            return 'The user for this gmail already exists', 400
        
        # Verify OTP
        if otp != session.get('otp') or gmail != session.get('email'):
            return 'Invalid OTP or email', 400
        
        try:
            # Create a new user
            new_user = OtherUser(name=name, position=position, section_designation=section_designation, office=office, username=username, password=encrypted_password, gmail=gmail)
            db.session.add(new_user)
            db.session.commit()
            send_account_creation_email(gmail)  # Send account creation email
        except psycopg2.OperationalError:
            flash('You took too long in creating the account, please refresh the page')
            return redirect(url_for('create_account'))
        
        return redirect(url_for('index'))
    
    return render_template('index.html')

@app.route('/check_email', methods=['POST'])
def check_email():
    email = request.form['email']
    email_exists = OtherUser.query.filter_by(gmail=email).first() is not None
    return {'exists': email_exists}

@app.route('/send_otp', methods=['POST'])
def send_otp_route():
    email = request.form['email']
    username = request.form['username']
    if OtherUser.query.filter_by(gmail=email).first():
        return 'Email already exists', 400
    send_otp(email)
    return 'OTP sent. Please check your email', 200

@app.route('/verify_otp', methods=['POST'])
def verify_otp_route():
    otp = request.form['otp']
    if otp == session.get('otp'):
        return 'OTP verified', 200
    else:
        return 'Invalid OTP', 400

@app.route('/DTS.html')
def dts():
    encrypted_username = request.args.get('username')
    try:
        username = serializer.loads(encrypted_username)  # Decrypt the username
    except:
        return 'Invalid username', 400

    user = OtherUser.query.filter_by(username=username).first()
    if user:
        section_designation = user.section_designation
    else:
        section_designation = "Unknown"
    
    documents = Document.query.all()
    current_datetime = datetime.now().strftime('%B %d, %Y %I:%M %p')
    return render_template('DTS.html', section_designation=section_designation, documents=documents)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

@app.route('/add_document', methods=['POST'])
def add_document():
    # Generate a unique tracking number in the format "TN-YEAR-00000"
    current_year = datetime.now().year
    last_document = Document.query.order_by(Document.id.desc()).first()
    if last_document:
        last_id = last_document.id
    else:
        last_id = 0
    tracking_no = f"TN-{current_year}-{last_id + 1:05d}"

    document_type = request.form['documentType']
    document_properties = request.form['documentProperties']
    subject = request.form['subject']
    date_released = request.form['dateReleased']
    receiving_office_section = request.form['receivingOfficeSection']
    status = "Pending"  # Automatically set to Pending
    document_category = request.form['documentCategory']

    new_document = Document(
        tracking_no=tracking_no,
        document_type=document_type,
        document_properties=document_properties,
        subject=subject,
        date_released=datetime.strptime(date_released, '%Y-%m-%dT%H:%M'),  # Updated format
        receiving_office_section=receiving_office_section,
        status=status,
        document_category=document_category
    )

    db.session.add(new_document)
    db.session.commit()

    return {'success': True}

@app.route('/document_details')
def document_details():
    tracking_no = request.args.get('tracking_no')
    document = Document.query.filter_by(tracking_no=tracking_no).first()
    if document:
        return {
            'tracking_no': document.tracking_no,
            'document_type': document.document_type,
            'document_properties': document.document_properties,
            'subject': document.subject,
            'date_released': document.date_released.isoformat(),
            'receiving_office_section': document.receiving_office_section,
            'status': document.status,
            'document_category': document.document_category
        }
    else:
        return {'error': 'Document not found'}, 404

@app.route('/update_document_status', methods=['POST'])
def update_document_status():
    data = request.get_json()
    tracking_no = data.get('tracking_no')
    status = data.get('status')

    document = Document.query.filter_by(tracking_no=tracking_no).first()
    if document:
        document.status = status
        db.session.commit()
        return {'success': True}
    else:
        return {'error': 'Document not found'}, 404

@app.route('/check_username', methods=['POST'])
def check_username():
    username = request.form['username']
    user_exists = OtherUser.query.filter_by(username=username).first() is not None
    return {'exists': user_exists}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
