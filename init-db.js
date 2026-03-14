
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  let adminPool;
  let appPool;

  try {
    // Create admin connection (to create database)
    console.log('🔄 Connecting to PostgreSQL server...');
    adminPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_ADMIN_USER || 'postgres',
      password: process.env.DB_ADMIN_PASSWORD || '',
    });

    console.log('✅ Connected to PostgreSQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'tripora_db';
    console.log(`🔄 Creating database "${dbName}" if it doesn't exist...`);
    
    try {
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created`);
    } catch (err) {
      if (err.code === '42P04') {
        console.log(`✅ Database "${dbName}" already exists`);
      } else {
        throw err;
      }
    }

    // Grant permissions to app user
    const dbUser = process.env.DB_USER || 'tripora_user';
    console.log(`🔄 Granting permissions to "${dbUser}"...`);
    await adminPool.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`);
    
    // Connect as admin to grant schema permissions
    const adminAppPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_ADMIN_USER || 'postgres',
      password: process.env.DB_ADMIN_PASSWORD || '',
      database: dbName,
    });

    // Grant schema permissions
    await adminAppPool.query(`GRANT CREATE, USAGE ON SCHEMA public TO ${dbUser}`);
    await adminAppPool.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${dbUser}`);
    await adminAppPool.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${dbUser}`);
    console.log(`✅ Permissions granted`);

    // Close admin connections
    await adminPool.end();
    await adminAppPool.end();

    // Create application connection
    console.log(`🔄 Connecting to database "${dbName}"...`);
    appPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'tripora_user',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
    });

    console.log(`✅ Connected to database "${dbName}"`);

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('🔄 Creating tables...');
    await appPool.query(schemaSql);
    console.log('✅ Tables created successfully');

    // Verify tables
    const result = await appPool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    
    console.log('\n📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n✅ Database initialization completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Update .env with your database credentials');
    console.log('   2. Run: npm install');
    console.log('   3. Run: npm run dev');
    console.log('   4. Test the /health endpoint\n');

  } catch (error) {
    // Ignore error if database already exists
    if (error.code === '42P04') { // Database already exists error
      console.log(`✅ Database already exists`);
      
      try {
        const dbName = process.env.DB_NAME || 'tripora_db';
        const dbUser = process.env.DB_USER || 'tripora_user';

        // Grant permissions using admin pool before closing
        console.log(`🔄 Granting permissions to "${dbUser}"...`);
        await adminPool.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`);
        
        // Connect as admin to grant schema permissions
        const adminAppPool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          user: process.env.DB_ADMIN_USER || 'postgres',
          password: process.env.DB_ADMIN_PASSWORD || '',
          database: dbName,
        });

        // Grant schema permissions
        await adminAppPool.query(`GRANT CREATE, USAGE ON SCHEMA public TO ${dbUser}`);
        await adminAppPool.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${dbUser}`);
        await adminAppPool.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${dbUser}`);
        console.log(`✅ Permissions granted`);

        // Close admin connections
        await adminPool.end();
        await adminAppPool.end();

        // Now connect as app user
        appPool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          user: dbUser,
          password: process.env.DB_PASSWORD || '',
          database: dbName,
        });

        // Read and execute schema.sql (creates tables with IF NOT EXISTS)
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log('🔄 Creating tables...');
        await appPool.query(schemaSql);
        console.log('✅ Tables created successfully');

        const result = await appPool.query(
          `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
        );
        
        console.log('\n📊 Created tables:');
        result.rows.forEach(row => {
          console.log(`   - ${row.table_name}`);
        });

        console.log('\n✅ Database initialization completed successfully!\n');
        console.log('📝 Next steps:');
        console.log('   1. Run: npm run dev');
        console.log('   2. Test the /health endpoint\n');
        return;
      } catch (e) {
        console.error('❌ Error setting up database:');
        console.error(e.message);
        process.exit(1);
      }
    }

    console.error('Database initialization failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    try {
      if (adminPool && !adminPool.ended) {
        await adminPool.end();
      }
    } catch (e) {
      // ignore
    }
    try {
      if (appPool && !appPool.ended) {
        await appPool.end();
      }
    } catch (e) {
      // ignore
    }
  }
};

// Run the initialization
initDatabase();

