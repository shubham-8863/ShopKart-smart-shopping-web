
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool using promises
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shopkart',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (process.env.DB_CA_CERT) {
  poolConfig.ssl = {
    ca: process.env.DB_CA_CERT,
    rejectUnauthorized: true,
  };
}

const pool = mysql.createPool(poolConfig);

// Helper function to test database connectivity
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ MySQL connection pool established successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.warn('⚠️  MySQL connection notice:', error.message);
    console.warn('   Ensure MySQL is running and database configuration is set in server/.env.');
    return false;
  }
}

export default pool;
