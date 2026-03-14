-- Create Users Table for Authentication
-- Supports email/password and OAuth (Google, Apple)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  apple_id VARCHAR(255) UNIQUE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  auth_type VARCHAR(50) NOT NULL CHECK (auth_type IN ('email', 'google', 'apple')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_apple_id ON users(apple_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON users(created_at);

-- Sample query to verify table creation
-- SELECT * FROM users;
