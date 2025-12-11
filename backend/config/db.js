const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'clinic_management_system';

const initDatabase = async () => {
  const tempConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  try {
    await tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    console.log(`Database '${DB_NAME}' ensured.`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await tempConnection.query(`USE \`${DB_NAME}\`;`);
      await tempConnection.query(schema);
      console.log('Tables created successfully.');
    }

  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    await tempConnection.end();
  }
};

let pool;

const initPool = async () => {
  if (!pool) {
    await initDatabase();

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};

const query = async (sql, params = []) => {
  const p = await initPool();
  const [results] = await p.execute(sql, params);
  return results;
};

const transaction = async (sqlOrQueries, params = []) => {
  const p = await initPool();
  const connection = await p.getConnection();

  try {
    await connection.beginTransaction();

    let results;

    // ✅ support single query
    if (typeof sqlOrQueries === 'string') {
      const [result] = await connection.execute(sqlOrQueries, params);
      results = [result];
    } 
    // ✅ support multiple queries
    else if (Array.isArray(sqlOrQueries)) {
      results = [];
      for (const q of sqlOrQueries) {
        const [res] = await connection.execute(q.sql, q.params);
        results.push(res);
      }
    }

    await connection.commit();
    return results;

  } catch (error) {
    await connection.rollback();
    console.error('Transaction Error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  query,
  transaction
};
