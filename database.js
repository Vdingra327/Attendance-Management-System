// database.js - MySQL Database Setup

const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // Change if your username is different
  password: 'jaiveer.com',           // ADD YOUR MYSQL ROOT PASSWORD HERE
  database: 'attendance_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisify for async/await
const promisePool = pool.promise();

console.log('✅ MySQL connection pool created');

// Function to test connection
async function testConnection() {
  try {
    const [rows] = await promisePool.query('SELECT 1');
    console.log('✅ Connected to MySQL database');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    return false;
  }
}

// Function to initialize database tables
async function initializeDatabase() {
  console.log('🔄 Creating tables...');

  try {
    // Create users table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'teacher', 'student') NOT NULL
      )
    `);
    console.log('✅ Users table ready');

    // Create timetable table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS timetable (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        class_date DATE NOT NULL,
        class_time TIME NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Timetable table ready');

    // Create qr_sessions table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS qr_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        created_at BIGINT NOT NULL,
        FOREIGN KEY (class_id) REFERENCES timetable(id)
      )
    `);
    console.log('✅ QR Sessions table ready');

    // Create attendance table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        status ENUM('present', 'absent') NOT NULL,
        timestamp BIGINT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (class_id) REFERENCES timetable(id),
        UNIQUE KEY unique_attendance (student_id, class_id)
      )
    `);
    console.log('✅ Attendance table ready');

    // Insert sample data
    await insertSampleData();

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

// Function to insert sample data
async function insertSampleData() {
  try {
    // Check if users exist
    const [rows] = await promisePool.query('SELECT COUNT(*) as count FROM users');
    
    if (rows[0].count === 0) {
      // Insert sample users
      await promisePool.query(`
        INSERT INTO users (name, role) VALUES 
        ('Admin User', 'admin'),
        ('John Smith', 'teacher'),
        ('Sarah Johnson', 'teacher'),
        ('Alice Brown', 'student'),
        ('Bob Wilson', 'student'),
        ('Charlie Davis', 'student')
      `);
      console.log('✅ Sample users inserted');
    } else {
      console.log('ℹ️  Sample data already exists');
    }
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    throw error;
  }
}

// Export pool and functions
module.exports = {
  pool: promisePool,
  testConnection,
  initializeDatabase
};