# 🧪 Complete Authentication Testing Guide (PostgreSQL)

## 📋 Prerequisites

### 1️⃣ **PostgreSQL Running**
```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT 1;"
```

### 2️⃣ **Create PostgreSQL User & Database**
```bash
psql -U postgres
```

```sql
-- In psql:
CREATE USER tripora_user WITH PASSWORD 'tripora_password';
ALTER ROLE tripora_user WITH CREATEDB;
\q
```

### 3️⃣ **Initialize Database**
```bash
npm run init-db
```

Expected output:
```
✅ Connected to PostgreSQL server
✅ Database "tripora_db" ready
✅ Tables created successfully
📊 Created tables:
   - users
✅ Database initialization completed successfully!
```

### 4️⃣ **.env Configured**
```env
# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tripora_db
DB_USER=tripora_user
DB_PASSWORD=tripora_password
DB_ADMIN_USER=postgres
DB_ADMIN_PASSWORD=postgres

# JWT
JWT_SECRET=tripora_secret_key
JWT_EXPIRE=7d

# Email (Gmail)
SMTP_USER=aitripora@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=aitripora@gmail.com

# OTP
OTP_EXPIRY=300
OTP_LENGTH=6
OTP_RESEND_COOLDOWN=60
```

---

## 🚀 Starting the Server

```bash
npm run dev
```

**Expected Output:**
```
✅ Database connected at: 2026-03-13T12:00:00.000Z
✅ Server running on port 5000 in development mode
📍 API URL: http://localhost:5000
```

---

## 🔄 Testing: Register → Verify Email → Login

### **Step 1️⃣: Register with Email**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Expected Response (201):**
```json
{
  "message": "User registration initiated. Check your email for OTP to complete registration.",
  "email": "john@example.com",
  "nextStep": "verify-otp",
  "otpExpirySeconds": 300,
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

**What Happens:**
✅ Email format validated  
✅ Password strength validated  
✅ Checks if email already exists  
✅ Hashes password with bcrypt  
✅ Stores pending user data in memory  
✅ Generates 6-digit OTP  
✅ Sends OTP email to john@example.com  
✅ OTP expires in 5 minutes  

---

### **Step 2️⃣: Get OTP from Email** 

#### **Option A: Check Gmail Inbox**
- Look for email from: aitripora@gmail.com
- Subject: "🔐 Your Tripora OTP Code"
- Extract the 6-digit code (e.g., 123456)

#### **Option B: Check Server Console (Dev Only)**
Look at terminal where `npm run dev` is running:
```
✅ OTP generated for john@example.com: 123456
```

#### **Option C: Check App Logs**
```bash
# Tail logs
tail -f server.log | grep "OTP generated"
```

---

### **Step 3️⃣: Verify OTP (with Email confirmation)**

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Email verified successfully",
  "email": "john@example.com",
  "nextStep": "login",
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

**What Happens:**
✅ OTP format validated (6 digits only)  
✅ Checks if OTP is expired  
✅ Verifies OTP matches the one sent  
✅ **Creates user in PostgreSQL database** ✨  
✅ Marks `is_email_verified = TRUE`  
✅ Clears OTP from memory  
✅ Sends "Welcome to Tripora" email  
✅ User can now login  

**Database State After This:**
```sql
SELECT * FROM users WHERE email = 'john@example.com';

 id |   name   |       email        | is_email_verified | auth_type
----+----------+--------------------+-------------------+----------
  1 | John Doe | john@example.com   | true              | email
```

---

### **Step 4️⃣: Login & Get JWT Token**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "auth_type": "email"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-03-20T10:30:00.000Z",
  "expiresIn": 604800,
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

**What Happens:**
✅ Finds user in PostgreSQL  
✅ Checks if email is verified  
✅ Compares password with bcrypt hash  
✅ Generates JWT token (7 days expiry)  
✅ Returns user + token  

---

## 🧪 Test Cases: Error Scenarios

### **❌ Error 1: Email Already Registered**

```bash
# Register same email twice
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Response (409):**
```json
{
  "error": "Email already registered",
  "message": "This email is already associated with an account. Please login or use a different email.",
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

---

### **❌ Error 2: Invalid OTP**

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "000000"
  }'
```

**Response (400):**
```json
{
  "error": "Invalid OTP",
  "message": "Invalid OTP",
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

---

### **❌ Error 3: Weak Password (Less than 8 chars)**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "weak",
    "confirmPassword": "weak"
  }'
```

**Response (400):**
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "body.password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

---

### **❌ Error 4: Password Missing Uppercase Letter**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepass123",
    "confirmPassword": "securepass123"
  }'
```

**Response (400):**
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "body.password",
      "message": "Password must contain at least one uppercase letter"
    }
  ],
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

---

### **❌ Error 5: Password Missing Number**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePass",
    "confirmPassword": "SecurePass"
  }'
```

**Response (400):**
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "body.password",
      "message": "Password must contain at least one number"
    }
  ],
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

---

### **❌ Error 6: Passwords Don't Match**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePass123",
    "confirmPassword": "DifferentPass456"
  }'
```

**Response (400):**
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "body.confirmPassword",
      "message": "Passwords do not match"
    }
  ],
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

---

### **❌ Error 7: Invalid Email Format**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "notanemail",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Response (400):**
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "body.email",
      "message": "Please provide a valid email address"
    }
  ],
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

---

### **❌ Error 8: Email Not Verified (Try to Login)**

```bash
# Register user but DON'T verify email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pending User",
    "email": "pending@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'

# Now try to login without verifying
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pending@example.com",
    "password": "SecurePass123"
  }'
```

**Response (401):**
```json
{
  "error": "Email not verified",
  "message": "Please verify your email before login. Check your inbox for the OTP.",
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

---

### **❌ Error 9: Invalid Login Credentials**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword123"
  }'
```

**Response (401):**
```json
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect.",
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

---

### **❌ Error 10: Resend OTP Too Soon (Rate Limited)**

```bash
# Request OTP resend within rate limit
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# Request again immediately (within 5 minutes)
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Response (429):**
```json
{
  "error": "Rate limit",
  "message": "Please wait before requesting a new OTP",
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```
  "message": "Invalid OTP"
}
```

#### **7. Expired OTP (wait 5+ minutes)**
```bash
# Wait 5 minutes, then verify
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

**Expected (400):**
```json
{
  "error": "Invalid OTP",
  "message": "OTP expired or not found"
}
```

---

## ✅ Positive Test Cases Summary

| Test | Endpoint | Method | Expected |
|------|----------|--------|----------|
| Register Valid | /api/auth/register | POST | 201 Created |
| Verify OTP | /api/auth/verify-otp | POST | 200 OK |
| Resend OTP | /api/auth/resend-otp | POST | 200 OK |
| Login Valid | /api/auth/login | POST | 200 OK + Token |

---

## 💾 Payload Requirements

### Register
```json
{
  "name": "2-100 chars",
  "email": "valid@email.com",
  "password": "8+ chars, 1 uppercase, 1 number",
  "confirmPassword": "must match password"
}
```

### Verify OTP
```json
{
  "email": "valid@email.com",
  "otp": "6 digits"
}
```

### Login
```json
{
  "email": "valid@email.com",
  "password": "from registration"
}
```

---

## 🔐 Security Checklist

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ Email validation before registration
- ✅ OTP stored in Redis (not MySQL)
- ✅ JWT tokens signed with secret key
- ✅ Random OTP generation (6 digits)
- ✅ 5-minute OTP expiry
- ✅ Error messages don't leak data
- ✅ Email verification required
- ✅ Auth type checking (email vs OAuth)

---

## 📊 Database Impact

After complete flow:

**Users table:**
```
id  | name      | email           | password (hashed) | is_email_verified | auth_type
1   | John Doe  | john@example.com | $2a$10$...       | 1                 | email
```

**Redis:**
```
Empty (OTP deleted after verification)
```

---

## 🐛 Debugging Tips

1. **Check server logs** for detailed errors
2. **Redis CLI** to inspect OTP:
   ```bash
   redis-cli GET otp:john@example.com
   ```

3. **MySQL** to check user:
   ```bash
   mysql -u root -p tripora_db
   SELECT * FROM users WHERE email='john@example.com';
   ```

4. **Decode JWT** online at https://jwt.io to inspect token

5. **Email not sending?** Check SMTP credentials in .env

---

## 📧 Email Troubleshooting Guide

### **Problem: OTP Emails Not Being Received**

#### **Step 1️⃣: Verify Email Service is Connected**

Look at server startup logs when you run `npm run dev`:

**✅ WORKING:**
```
🔍 Testing Email Service Connection...
   SMTP User: bgrills57@gmail.com
   From Email: bgrill57@gmail.com
✅ Email Service Connected & Ready!
   ✓ SMTP Connection Verified
   ✓ Gmail Credentials Valid
   ✓ Ready to send emails
```

**❌ NOT WORKING:**
```
❌ Email Service Connection Failed!
   Error: Invalid login - 535-5.7.8 Username and App password not accepted
🔧 Troubleshooting Checklist:
   ❌ Check Gmail Credentials:
      - SMTP_USER: bgrills57@gmail.com
      - SMTP_PASS: [SET]
   ❌ Verify Gmail App Password:
      1. Go to: https://myaccount.google.com/apppasswords
      2. Select: Mail → Windows Computer
      3. Generate 16-character app password
      4. Update SMTP_PASS in .env file
```

#### **Step 2️⃣: Generate Gmail App Password** 

⚠️ **You MUST use a Gmail App Password, not your regular password!**

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Google account
3. Select: **Mail** (left dropdown)
4. Select: **Windows Computer** (right dropdown) - or your device
5. Click: **Generate**
6. Copy the 16-character password (spaces included)

**Example:**
```
Generated App Password:
yqrv rblb mzlw ympm
(Copy without spaces): yqrvrbibmzlwympm
```

#### **Step 3️⃣: Update .env File**

```bash
nano .env
# or
code .env
```

Find and update:
```env
# BEFORE (doesn't work):
SMTP_PASS=your_regular_gmail_password

# AFTER (should work):
SMTP_PASS=yqrvrbibmzlwympm
```

**Save and restart server:**
```bash
npm run dev
```

You should see:
```
✅ Email Service Connected & Ready!
```

#### **Step 4️⃣: Test Email Delivery** 

Send a test email to verify SMTP works:

```bash
curl -X POST http://localhost:5000/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com"
  }'
```

**Expected Response:**
```json
{
  "message": "Test email sent successfully! Check your inbox.",
  "email": "your-test-email@gmail.com",
  "timestamp": "2026-03-13T10:30:00.000Z"
}
```

**What to see in server logs:**
```
📧 Sending test email to: your-test-email@gmail.com
✅ Test email sent successfully!
   Response: 250 2.0.0 OK ...
```

**Check your inbox:**
- Look for email from `bgrill57@gmail.com`
- Subject: "🔧 Tripora Email Service Test"
- Usually arrives within 1-5 seconds

#### **Step 5️⃣: Test OTP Email Flow**

Once test email works, try complete registration:

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@gmail.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Server logs should show:**
```
📧 Attempting to send OTP email to: your-email@gmail.com
🔐 OTP Code: 123456 (valid for 5 minutes)
✅ OTP email sent successfully!
   Response: 250 2.0.0 OK ...
```

**Check your Gmail:**
- Subject: "🔐 Your Tripora OTP Code"
- Body: Large 6-digit code (e.g., 123456)

#### **Step 6️⃣: Complete OTP Verification**

Once you receive the OTP:

```bash
# 2. Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "otp": "123456"
  }'
```

Should get:
```json
{
  "message": "Email verified successfully",
  "email": "your-email@gmail.com",
  "nextStep": "login"
}
```

```bash
# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "password": "SecurePass123"
  }'
```

Should get JWT token ✅

---

### **Common Problems & Solutions**

#### **Problem: "Invalid login - 535-5.7.8 Username and App password not accepted"**

**Cause:** Wrong app password or configuration

**Solution:**
1. Check if 2FA is enabled on Gmail account
2. Generate NEW app password (old one won't work)
3. Copy password WITHOUT spaces
4. Update .env exactly
5. Restart server

#### **Problem: "Connection refused"**

**Cause:** Gmail SMTP service not accessible

**Solution:**
1. Check internet connection
2. Disable VPN if using one
3. Try from different network
4. Check Gmail security settings

#### **Problem: "Email sent but never received"**

**Cause:** Email ends up in Spam/Promotions folder

**Solution:**
1. Check Spam, Promotions, Social tabs
2. Mark email as "Not Spam"
3. Add bgrill57@gmail.com to Contacts
4. Check email filters/rules

#### **Problem: "Timeout waiting for email"**

**Cause:** SMTP server slow or misconfigured

**Solution:**
1. Check SMTP credentials again
2. Try test email endpoint first
3. Check server logs for detailed error
4. Increase timeout if needed

---

### **Email Configuration Checklist**

| Item | Status | Fix |
|------|--------|-----|
| Gmail account has 2FA enabled | ✅ | Required |
| App password generated | ❌ | Go to myaccount.google.com/apppasswords |
| SMTP_USER in .env | ❌ | Set to Gmail address (bgrills57@gmail.com) |
| SMTP_PASS in .env | ❌ | Set to 16-char app password (no spaces) |
| FROM_EMAIL in .env | ❌ | Set to Gmail address |
| Email service test passes | ❌ | POST /auth/test-email |
| OTP email received | ❌ | Check inbox/spam after registration |

---

## ✨ Next Steps

- [ ] Implement password reset
- [ ] Add refresh tokens
- [ ] Add Google OAuth
- [ ] Add Apple OAuth
- [ ] Rate limiting on endpoints
- [ ] Two-factor authentication
