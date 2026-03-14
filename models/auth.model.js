/**
 * Auth Model Schema
 * Defines authentication-related database schemas and structures
 */

/**
 * User Auth Schema
 * @typedef {Object} AuthUser
 * @property {number} id - Unique identifier
 * @property {string} name - User's full name
 * @property {string} email - User's email (unique)
 * @property {string|null} password - Hashed password
 * @property {string|null} google_id - Google OAuth ID
 * @property {string|null} apple_id - Apple OAuth ID
 * @property {boolean} is_email_verified - Email verification status
 * @property {string} auth_type - Auth type (email|google|apple)
 * @property {Date} created_at - Account creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

const authSchema = {
  id: 'number',
  name: 'string',
  email: 'string',
  password: 'string|null',
  google_id: 'string|null',
  apple_id: 'string|null',
  is_email_verified: 'boolean',
  auth_type: 'enum:email|google|apple',
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

module.exports = {
  authSchema,
};
