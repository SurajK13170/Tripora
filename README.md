# Tripora Backend - Mobile AI Travel Guide API

Production-ready backend for a mobile AI travel guide application built with Node.js, Express.js, and PostgreSQL.

## 📋 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL 12+
- **Authentication:** JWT, Passport.js (Google OAuth, Apple OAuth)
- **Caching:** Redis
- **Email:** Nodemailer
- **Validation:** Zod
- **Security:** Helmet, bcryptjs, express-rate-limit

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have installed:
- **Node.js** (v14+)
- **PostgreSQL** (v12+)
- **Redis** (optional, for caching)

### 2. Clone and Install

```bash
cd /home/suraj/Downloads/Tripora
npm install
```

### 3. Setup PostgreSQL Database

Create a PostgreSQL user and database:

```bash
# Login to PostgreSQL
psql -U postgres

# Run these commands in psql:
CREATE USER tripora_user WITH PASSWORD 'your_password';
ALTER ROLE tripora_user WITH CREATEDB;
```

Or update `.env` with your PostgreSQL admin credentials and run:

```bash
npm run init-db
```

### 4. Setup Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tripora_db
DB_USER=tripora_user
DB_PASSWORD=your_password
DB_ADMIN_USER=postgres
DB_ADMIN_PASSWORD=your_admin_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Email (Gmail)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

Test health endpoint:
```bash
curl http://localhost:5000/health
```

## 📁 Project Structure

```
/home/suraj/Downloads/Tripora/
├── index.js                    # Main entry point
├── db.js                       # MySQL connection & methods
├── init-db.js                  # Database initialization script
├── .env                        # Environment variables
├── package.json                # Dependencies
│
├── models/
│   └── User.js                # User database model
│
├── routes/                     # API routes (TODO: Step 4+)
├── middleware/                 # Custom middleware
│   └── asyncHandler.js
├── services/                   # Business logic layer
├── utils/
│   └── constants.js           # App constants
├── config/
│   └── redis.js               # Redis configuration
│
└── database/
    └── schema.sql             # Database schema
```

## 🔐 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  apple_id VARCHAR(255) UNIQUE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  auth_type ENUM('email', 'google', 'apple'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 📚 Available Scripts

```bash
# Start production server
npm start

# Start development server with hot reload
npm run dev

# Initialize database
npm run init-db
```

## 🔄 Development Progress

- [x] Step 1: Project Initialization
- [x] Step 2: Database Setup (MySQL)
- [x] Step 3: Users Table Schema
- [ ] Step 4: Email Registration System
- [ ] Step 5: OTP Verification
- [ ] Step 6: Login System
- [ ] Step 7: Google OAuth
- [ ] Step 8: Apple OAuth
- [ ] Step 9: JWT Middleware
- [ ] Step 10: Rate Limiting & Security

## 🤝 Contributing

This is a development project. Features are being added step-by-step.

## 📝 License

ISC
