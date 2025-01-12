from flask import Flask, render_template, request, redirect, url_for, send_from_directory, session, flash
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import psycopg2
import os
import smtplib
import random
import string
import uuid  #generating unique tracking numbers
from itsdangerous import URLSafeSerializer  #URL encryption
from flask_bcrypt import Bcrypt  #password hashing

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')  # Load secret key from .env file
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
    receiving_office = db.Column(db.String(100), nullable=False)  # Changed variable name
    receiving_section = db.Column(db.String(100), nullable=False)  # New column
    sender_office = db.Column(db.String(100), nullable=False)  # New column
    sender_section = db.Column(db.String(100), nullable=False)  # New column
    status = db.Column(db.String(50), nullable=False)
    document_category = db.Column(db.String(100), nullable=False)

# Database model for Admin Users
class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

# Database model for Super Users
class SuperUser(db.Model):
    __tablename__ = 'super_users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    gmail = db.Column(db.String(255), unique=True, nullable=False)  # Add this line

# Database model for Offices
class Office(db.Model):
    __tablename__ = 'offices'
    id = db.Column(db.Integer, primary_key=True)
    section_designation = db.Column(db.String(100), nullable=False)
    office_category = db.Column(db.String(100), nullable=False)

# Database model for Document Categories
class DocumentCategory(db.Model):
    __tablename__ = 'document_category'
    document_type = db.Column(db.String(100), primary_key=True)
    level_of_priority = db.Column(db.String(50))
    deadline = db.Column(db.Integer)

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

def send_document_added_email(user, user_gmail, section, office, document_subject, document_category, tracking_no, receiving_office, receiving_section):
    super_users = SuperUser.query.with_entities(SuperUser.gmail).all()
    sender_email = os.getenv('SENDER_EMAIL')
    sender_password = os.getenv('SENDER_PASSWORD')
    subject = "New Document Added"
    view_file_url = f"https://dts-denr.onrender.com/viewFile.html/{tracking_no}"
    body = f"""
    <html>
    <body>
        <table border="1" cellpadding="10" cellspacing="0">
            <tr>
                <th>Username</th>
                <td>{user}</td>
            </tr>
            <tr>
                <th>Gmail</th>
                <td>{user_gmail}</td>
            </tr>
            <tr>
                <th>SECTION</th>
                <td>{section}</td>
            </tr>
            <tr>
                <th>OFFICE</th>
                <td>{office}</td>
            </tr>
            <tr>
                <th>DOCUMENT SUBJECT</th>
                <td>{document_subject}</td>
            </tr>
            <tr>
                <th>DOCUMENT CATEGORY</th>
                <td>{document_category}</td>
            </tr>
            <tr>
                <th>RECEIVING OFFICE</th>
                <td>{receiving_office}</td>
            </tr>
            <tr>
                <th>RECEIVING SECTION</th>
                <td>{receiving_section}</td>
            </tr>
            <tr>
                <th style="background-color: yellow;">TRACKING NO</th>
                <td style="background-color: yellow;">{tracking_no}</td>
            </tr>
        </table>
        <p>View the document details <a href="{view_file_url}">here</a>.</p>
    </body>
    </html>
    """

    message = f"Subject: {subject}\nContent-Type: text/html\n\n{body}"

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        for super_user in super_users:
            server.sendmail(sender_email, super_user.gmail, message)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    if not username or not password:
        return 'Username and password are required', 400

    # Check if the user exists in the super_users table
    super_user = SuperUser.query.filter_by(username=username).first()
    if super_user:
        try:
            if bcrypt.check_password_hash(super_user.password, password):
                return redirect(url_for('admin_dnga'))
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

@app.route('/admin_dnga')
def admin_dnga():
    return render_template('admin_dnga.html')

@app.route('/create_account', methods=['GET', 'POST'])
def create_account():
    if request.method == 'POST':
        name = request.form['name']
        position = request.form['position']
        section_designation = request.form['section']
        username = request.form['username']
        encrypted_password = bcrypt.generate_password_hash(request.form['password']).decode('utf-8')
        gmail = request.form['email']
        otp = request.form['otp']
        
        if not name or not position or not section_designation or not username or not encrypted_password or not gmail or not otp:
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
            new_user = OtherUser(name=name, position=position, section_designation=section_designation, username=username, password=encrypted_password, gmail=gmail)
            db.session.add(new_user)
            db.session.commit()
            send_account_creation_email(gmail)  # Send account creation email
        except psycopg2.OperationalError:
            flash('You took too long in creating the account, please refresh the page')
            return redirect(url_for('create_account'))
        
        return render_template('index.html', success_message='Account created successfully!')
    
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
        office = user.office
    else:
        section_designation = "Unknown"
        office = "Unknown"
    
    documents = Document.query.all()
    document_types = DocumentCategory.query.with_entities(DocumentCategory.document_type).distinct().all()
    offices = Office.query.all()  # Fetch all offices
    current_datetime = datetime.now().strftime('%B %d, %Y %I:%M %p')
    return render_template('DTS.html', section_designation=section_designation, office=office, documents=documents, document_types=document_types, offices=offices)

@app.route('/incoming_documents')
def incoming_documents():
    encrypted_username = request.args.get('username')
    try:
        username = serializer.loads(encrypted_username)  # Decrypt the username
    except:
        return 'Invalid username', 400

    user = OtherUser.query.filter_by(username=username).first()
    if user:
        receiving_office = user.office
        receiving_section = user.section_designation
    else:
        return 'User not found', 404

    documents = Document.query.filter_by(receiving_office=receiving_office, receiving_section=receiving_section).all()
    document_types = DocumentCategory.query.with_entities(DocumentCategory.document_type).distinct().all()
    offices = Office.query.all()  # Fetch all offices
    current_datetime = datetime.now().strftime('%B %d, %Y %I:%M %p')
    return render_template('DTS.html', section_designation=receiving_section, office=receiving_office, documents=documents, document_types=document_types, offices=offices)

@app.route('/all_documents')
def all_documents():
    encrypted_username = request.args.get('username')
    try:
        username = serializer.loads(encrypted_username)  # Decrypt the username
    except:
        return 'Invalid username', 400

    user = OtherUser.query.filter_by(username=username).first()
    if user:
        section_designation = user.section_designation
        office = user.office
    else:
        section_designation = "Unknown"
        office = "Unknown"
    
    documents = Document.query.all()
    document_types = DocumentCategory.query.with_entities(DocumentCategory.document_type).distinct().all()
    offices = Office.query.all()  # Fetch all offices
    current_datetime = datetime.now().strftime('%B %d, %Y %I:%M %p')
    return render_template('DTS.html', section_designation=section_designation, office=office, documents=documents, document_types=document_types, offices=offices)

@app.route('/outgoing_documents')
def outgoing_documents():
    encrypted_username = request.args.get('username')
    try:
        username = serializer.loads(encrypted_username)  # Decrypt the username
    except:
        return 'Invalid username', 400

    user = OtherUser.query.filter_by(username=username).first()
    if user:
        sender_office = user.office
        sender_section = user.section_designation
    else:
        return 'User not found', 404

    documents = Document.query.filter_by(sender_office=sender_office, sender_section=sender_section).all()
    document_types = DocumentCategory.query.with_entities(DocumentCategory.document_type).distinct().all()
    offices = Office.query.all()  # Fetch all offices
    current_datetime = datetime.now().strftime('%B %d, %Y %I:%M %p')
    return render_template('DTS.html', section_designation=sender_section, office=sender_office, documents=documents, document_types=document_types, offices=offices)

@app.route('/on_process_documents')
def on_process_documents():
    encrypted_username = request.args.get('username')
    try:
        username = serializer.loads(encrypted_username)  # Decrypt the username
    except:
        return 'Invalid username', 400

    user = OtherUser.query.filter_by(username=username).first()
    if user:
        office = user.office
        section_designation = user.section_designation
    else:
        return 'User not found', 404

    documents = Document.query.filter(
        (Document.sender_office == office) | (Document.receiving_office == office),
        (Document.sender_section == section_designation) | (Document.receiving_section == section_designation),
        Document.status.in_(["Pending", "Processing"])  # Filter by status
    ).all()
    document_types = DocumentCategory.query.with_entities(DocumentCategory.document_type).distinct().all()
    offices = Office.query.all()  # Fetch all offices
    current_datetime = datetime.now().strftime('%B %d, %Y %I:%M %p')
    return render_template('DTS.html', section_designation=section_designation, office=office, documents=documents, document_types=document_types, offices=offices)

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
    receiving_office = request.form['receivingOffice']  # Changed variable name
    receiving_section = request.form['receivingSection']  # New variable
    sender_office = request.form['senderOffice']  # New variable
    sender_section = request.form['senderSection']  # New variable
    status = "Pending"  # Automatically set to Pending
    document_category = request.form['documentCategory']
    encrypted_username = request.form['username']  # Ensure this field is included
    section = request.form['section']  # Ensure this field is included

    new_document = Document(
        tracking_no=tracking_no,
        document_type=document_type,
        document_properties=document_properties,
        subject=subject,
        date_released=datetime.strptime(date_released, '%Y-%m-%dT%H:%M'),  # Updated format
        receiving_office=receiving_office,  # Changed variable name
        receiving_section=receiving_section,  # New variable
        sender_office=sender_office,  # New variable
        sender_section=sender_section,  # New variable
        status=status,
        document_category=document_category
    )

    db.session.add(new_document)
    db.session.commit()

    # Decrypt the username for the email notification
    username = serializer.loads(encrypted_username)
    user = OtherUser.query.filter_by(username=username).first()
    user_gmail = user.gmail

    # Send email notification to super users
    send_document_added_email(username, user_gmail, section, sender_office, subject, document_category, tracking_no, receiving_office, receiving_section)

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
            'receiving_office': document.receiving_office,  # Changed variable name
            'receiving_section': document.receiving_section,  # New variable
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

@app.route('/terms_ofService')
def terms_of_service():
    return render_template('terms_ofService.html')

@app.route('/privacyPolicy')
def privacy_policy():
    return render_template('privacyPolicy.html')

@app.route('/S_userOptions/addOffice.html', methods=['GET', 'POST'])
def add_office():
    if request.method == 'POST':
        section_designation = request.form['section_designation']
        office_category = request.form['office_category']
        
        if not section_designation or not office_category:
            return 'All fields are required', 400
        
        new_office = Office(section_designation=section_designation, office_category=office_category)
        db.session.add(new_office)
        db.session.commit()
        
        return redirect(url_for('add_office'))
    
    offices = Office.query.all()
    return render_template('S_userOptions/addOffice.html', offices=offices)

@app.route('/edit_office/<int:id>', methods=['POST'])
def edit_office(id):
    office = Office.query.get(id)
    if office:
        office.section_designation = request.form['section_designation']
        office.office_category = request.form['office_category']
        db.session.commit()
        return redirect(url_for('add_office'))
    return 'Office not found', 404

@app.route('/delete_office/<int:id>', methods=['DELETE'])
def delete_office(id):
    office = Office.query.get(id)
    if office:
        db.session.delete(office)
        db.session.commit()
        return {'success': True}
    return {'success': False}, 404

@app.route('/get_document_categories')
def get_document_categories():
    document_type = request.args.get('document_type')
    categories = DocumentCategory.query.filter_by(document_type=document_type).all()
    return [{'Level_of_Priority': category.level_of_priority} for category in categories]

@app.route('/viewFile.html/<tracking_no>')
def view_file(tracking_no):
    document = Document.query.filter_by(tracking_no=tracking_no).first()
    if document:
        file_url = f"/uploads/{document.tracking_no}.pdf"  # Adjust the file path as needed
        return render_template('viewFile.html', document=document, file_url=file_url)
    else:
        return {'error': 'Document not found'}, 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)