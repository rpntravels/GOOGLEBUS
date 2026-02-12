from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

# Create database
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE,
                  password TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Home page
@app.route('/')
def home():
    return render_template('home.html')

# Signup page
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        try:
            c.execute("INSERT INTO users (username, password) VALUES (?, ?)",
                      (username, password))
            conn.commit()
            conn.close()
            return redirect(url_for('login'))
        except:
            return "Username already exists!"
    return render_template('signup.html')

# Login page
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username=? AND password=?",
                  (username, password))
        user = c.fetchone()
        conn.close()

        if user:
            return "Login Successful!"
        else:
            return "Invalid Username or Password!"

    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
    from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
import random
from twilio.rest import Client

app = Flask(__name__)
app.secret_key = "secretkey123"

# Twilio credentials (PUT YOUR DETAILS)
account_sid = "YOUR_ACCOUNT_SID"
auth_token = "YOUR_AUTH_TOKEN"
twilio_number = "YOUR_TWILIO_PHONE_NUMBER"

client = Client(account_sid, auth_token)

# Create DB
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE,
                  password TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Home
@app.route('/')
def home():
    return redirect('/login')

# Signup
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        try:
            c.execute("INSERT INTO users (username, password) VALUES (?, ?)",
                      (username, password))
            conn.commit()
            conn.close()
            return redirect('/login')
        except:
            return "Username already exists!"
    return render_template('signup.html')

# Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username=? AND password=?",
                  (username, password))
        user = c.fetchone()
        conn.close()

        if user:
            session['user'] = username
            return redirect('/profile')
        else:
            return "Invalid credentials"

    return render_template('login.html')

# Profile page (Enter details)
@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if request.method == 'POST':
        name = request.form['name']
        age = request.form['age']
        email = request.form['email']
        phone = request.form['phone']

        otp = str(random.randint(100000, 999999))
        session['otp'] = otp
        session['phone'] = phone

        # Send OTP via Twilio
        message = client.messages.create(
            body=f"Your OTP is {otp}",
            from_=twilio_number,
            to=phone
        )

        return redirect('/verify_otp')

    return render_template('profile.html')

# Verify OTP
@app.route('/verify_otp', methods=['GET', 'POST'])
def verify_otp():
    if request.method == 'POST':
        user_otp = request.form['otp']
        if user_otp == session.get('otp'):
            return redirect('/dashboard')
        else:
            return "Invalid OTP"

    return render_template('verify_otp.html')

# Dashboard
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    app.run(debug=True)
account_sid = "YOUR_ACCOUNT_SID"
auth_token = "YOUR_AUTH_TOKEN"
twilio_number = "YOUR_TWILIO_PHONE_NUMBER"
from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)

# Create database automatically
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            age INTEGER,
            email TEXT,
            phone TEXT,
            password TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def signup_page():
    return render_template('signup.html')

@app.route('/signup', methods=['POST'])
def signup():
    name = request.form['name']
    age = request.form['age']
    email = request.form['email']
    phone = request.form['phone']
    password = request.form['password']

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (name, age, email, phone, password) VALUES (?, ?, ?, ?, ?)",
                   (name, age, email, phone, password))
    conn.commit()
    conn.close()

    return "Signup Successful!"

if __name__ == '__main__':
    app.run(debug=True)
project/
│ app.py
│
└── templates/
    │ signup.html
    │ login.html
    │ verify.html
    │ dashboard.html

from flask import Flask, render_template, request, redirect, session
import mysql.connector
import random

app = Flask(__name__)
app.secret_key = "secretkey"

# MySQL Connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="YOUR_MYSQL_PASSWORD",
    database="website_db"
)

cursor = db.cursor()

# ---------------- SIGNUP ----------------
@app.route('/')
def signup_page():
    return render_template("signup.html")

@app.route('/signup', methods=['POST'])
def signup():
    name = request.form['name']
    age = request.form['age']
    email = request.form['email']
    phone = request.form['phone']
    password = request.form['password']

    otp = str(random.randint(100000,999999))
    session['otp'] = otp
    session['email'] = email

    cursor.execute("INSERT INTO users (name, age, email, phone, password) VALUES (%s,%s,%s,%s,%s)",
                   (name, age, email, phone, password))
    db.commit()

    print("OTP:", otp)  # Free method: OTP shows in terminal

    return redirect('/verify')

# ---------------- VERIFY OTP ----------------
@app.route('/verify')
def verify_page():
    return render_template("verify.html")

@app.route('/verify_otp', methods=['POST'])
def verify():
    user_otp = request.form['otp']

    if user_otp == session['otp']:
        cursor.execute("UPDATE users SET verified=TRUE WHERE email=%s", (session['email'],))
        db.commit()
        return redirect('/login')
    else:
        return "Invalid OTP"

# ---------------- LOGIN ----------------
@app.route('/login')
def login_page():
    return render_template("login.html")

@app.route('/login_user', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    cursor.execute("SELECT * FROM users WHERE email=%s AND password=%s AND verified=TRUE",
                   (email, password))
    user = cursor.fetchone()

    if user:
        session['user'] = user[1]
        return redirect('/dashboard')
    else:
        return "Invalid Details or Not Verified"

# ---------------- DASHBOARD ----------------
@app.route('/dashboard')
def dashboard():
    if 'user' in session:
        return render_template("dashboard.html", name=session['user'])
    return redirect('/login')

if __name__ == "__main__":
    app.run(debug=True)


