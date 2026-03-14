# 📁 New Project Structure - Organized & Simple

## 🎯 Overview
Your Tripora backend has been restructured for **simplicity and maintainability**. All related code is grouped logically.

---

## 📂 **Directory Structure**

```
Tripora/
├── routes/
│   ├── auth.routes.js         ← Auth endpoints + all logic (register, login, verify-otp)
│   └── user.routes.js         ← User endpoints (profile, get all, delete)
│
├── models/
│   ├── auth.model.js          ← Auth schema & structure
│   └── user.model.js          ← User schema & database queries
│
├── middleware/
│   ├── validation.js          ← All Zod validation schemas
│   ├── authentication.js      ← JWT token verification
│   └── errorHandler.js        ← Async wrapper + global error handling
│
├── services/
│   ├── emailService.js        ← Send OTP/Welcome emails
│   └── otpService.js          ← Generate, verify, store OTPs
│
├── utils/
│   ├── constants.js           ← HTTP status codes, config
│   └── jwt.js                 ← Token generation & verification
│
├── config/
│   └── redis.js               ← Redis client setup
│
├── database/
│   └── schema.sql             ← MySQL table definitions
│
├── index.js                   ← Main server setup
├── db.js                      ← MySQL connection pool
├── init-db.js                 ← Database initialization
├── package.json               ← Dependencies
└── .env                       ← Environment variables
```

---

## 🚀 **Key Features of New Structure**

### **1. Routes with Embedded Logic**
All endpoint logic is directly in route files. No separate controllers needed.

```javascript
// routes/auth.routes.js
router.post('/register', validateRequest(registerSchema), asyncHandler(async (req, res) => {
  // All logic here: validation, DB operations, email sending
}));
```

### **2. Organized Models**
- `auth.model.js` - Auth-related schemas
- `user.model.js` - User schemas + SQL query constants

```javascript
// models/user.model.js
const Users = {
  findById: `SELECT * FROM users WHERE id = ? LIMIT 1`,
  create: `INSERT INTO users (name, email, ...) VALUES (?, ?, ...)`,
  // ... more queries
};
```

### **3. Centralized Middleware**
- `validation.js` - All Zod schemas in one place
- `authentication.js` - JWT verification
- `errorHandler.js` - Error handling + async wrapper

### **4. Service Layer**
- `emailService.js` - Email operations
- `otpService.js` - OTP operations
- Services handle business logic, routes handle HTTP

---

## 📝 **Available Endpoints**

### **Auth Routes** (`/api/auth`)
- `POST /register` - Create account with email/password
- `POST /verify-otp` - Verify OTP and activate
- `POST /resend-otp` - Resend OTP
- `POST /login` - Login and get JWT token

### **User Routes** (`/api/users`)
- `GET /profile` - Get current user profile (protected)
- `GET /all` - Get all users (protected)
- `DELETE /delete/:id` - Delete user account (protected)

---

## 🔐 **Middleware Usage**

### **Validation**
```javascript
router.post('/register', validateRequest(registerSchema), handler);
```

### **Authentication (Protected Routes)**
```javascript
router.get('/profile', verifyAuth, handler);
```

### **Async Error Handling**
```javascript
router.post('/login', asyncHandler(async (req, res) => {
  // Errors automatically caught and passed to error handler
}));
```

---

## 🛠️ **Quick Commands**

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server
npm run dev

# Test health endpoint
curl http://localhost:5000/health
```

---

## 📚 **File Descriptions**

| File | Purpose |
|------|---------|
| **routes/auth.routes.js** | Auth endpoints: register, verify OTP, login |
| **routes/user.routes.js** | User endpoints: profile, list, delete |
| **models/auth.model.js** | Authentication schema definitions |
| **models/user.model.js** | User schema + SQL queries |
| **middleware/validation.js** | Zod validation schemas (register, login, OTP) |
| **middleware/authentication.js** | JWT token verification middleware |
| **middleware/errorHandler.js** | Global error handler + async wrapper |
| **services/emailService.js** | Send OTP and welcome emails |
| **services/otpService.js** | Generate, verify, store OTPs |
| **utils/jwt.js** | Token generation and verification |
| **utils/constants.js** | HTTP status, auth types, config |
| **config/redis.js** | Redis client for OTP caching |

---

## ✨ **Benefits of New Structure**

✅ **Simple** - Routes contain all logic, no scattered files  
✅ **Organized** - Related files grouped together  
✅ **Scalable** - Easy to add new routes/models  
✅ **Maintainable** - Clear separation of concerns  
✅ **Readable** - Middleware, models, services are obvious  

---

## 🔄 **Migration Notes**

Old structure had:
- `controllers/authController.js`
- `routes/authRoutes.js`
- `middleware/validateRequest.js`
- `middleware/authMiddleware.js`
- `middleware/asyncHandler.js`
- `models/User.js`
- `services/userService.js`

**New structure consolidates and organizes:**
- ✅ Routes now contain logic (no separate controller)
- ✅ Middleware unified: validation.js, authentication.js, errorHandler.js
- ✅ Models now include SQL queries
- ✅ Services only handle business logic (email, OTP)

---

## 🎓 **Next Steps**

1. Test the new structure with `npm run dev`
2. Try the `/health` endpoint
3. Test authentication endpoints with curl/Postman
4. Add more routes following the same pattern
5. Keep services for reusable business logic

---

**Happy coding! 🚀**
