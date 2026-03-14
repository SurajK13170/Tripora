
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Unexpected connection pool error:', err);
});

/**
 * Execute a query on the database
 */
const query = async (queryText, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(queryText, params);
    return { rows: result.rows };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get a single row from the database
 */
const getOne = async (queryText, params = []) => {
  const result = await query(queryText, params);
  return result.rows[0] || null;
};

/**
 * Get all rows from the database
 */
const getAll = async (queryText, params = []) => {
  const result = await query(queryText, params);
  return result.rows;
};

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    console.log('Database connected at:', result.rows[0].time);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getOne,
  getAll,
  testConnection,
};
