
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection pool using promises
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shopkart_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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
