/**
 * User Model Schema
 * Defines user-related database schemas and structures
 */

/**
 * User Profile Schema
 * @typedef {Object} UserProfile
 * @property {number} id - User ID
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {boolean} is_email_verified - Email verification status
 * @property {string} auth_type - Authentication type
 * @property {Date} created_at - Account creation date
 */

const userSchema = {
  id: 'number',
  name: 'string',
  email: 'string',
  is_email_verified: 'boolean',
  auth_type: 'enum:email|google|apple',
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

/**
 * User database operations (queries)
 * All queries use PostgreSQL parameterized syntax ($1, $2, etc.)
 */
const Users = {
  /**
   * Create new user
   */
  create: `
    INSERT INTO users (name, email, password, google_id, apple_id, auth_type, is_email_verified)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name, email, auth_type, created_at
  `,

  /**
   * Find user by email
   */
  findByEmail: `SELECT * FROM users WHERE email = $1 LIMIT 1`,

  /**
   * Find user by ID
   */
  findById: `SELECT * FROM users WHERE id = $1 LIMIT 1`,

  /**
   * Find user by Google ID
   */
  findByGoogleId: `SELECT * FROM users WHERE google_id = $1 LIMIT 1`,

  /**
   * Find user by Apple ID
   */
  findByAppleId: `SELECT * FROM users WHERE apple_id = $1 LIMIT 1`,

  /**
   * Verify user email
   */
  verifyEmail: `UPDATE users SET is_email_verified = TRUE WHERE id = $1 RETURNING *`,

  /**
   * Update user
   */
  update: (fields) => {
    const updates = Object.keys(fields).map((f, i) => `${f} = $${i + 1}`).join(', ');
    return `UPDATE users SET ${updates} WHERE id = $${Object.keys(fields).length + 1} RETURNING *`;
  },

  /**
   * Get all users (admin)
   */
  getAll: `SELECT id, name, email, is_email_verified, auth_type, created_at FROM users LIMIT $1 OFFSET $2`,

  /**
   * Delete user
   */
  delete: `DELETE FROM users WHERE id = $1 RETURNING id`
};

module.exports = {
  userSchema,
  Users,
};
