// server.js - Main Express Server with All Routes

const express = require('express');
const cors = require('cors');
const { pool, testConnection, initializeDatabase } = require('./database');

// Import routes
// Import routes
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route to verify server is running
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Attendance Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// Test route to get all users
app.get('/api/test/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// Start server
async function startServer() {
  try {
    // Test MySQL connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot start server - MySQL connection failed');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log('=================================');
      console.log('🚀 Server is running!');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log('=================================');
      console.log('📋 Available API Endpoints:');
      console.log('');
      console.log('ADMIN:');
      console.log('  GET  /api/admin/users');
      console.log('  GET  /api/admin/timetable');
      console.log('  POST /api/admin/timetable');
      console.log('  GET  /api/admin/attendance');
      console.log('');
      console.log('TEACHER:');
      console.log('  GET  /api/teacher/:teacherId/classes');
      console.log('  POST /api/teacher/qr/:classId');
      console.log('  GET  /api/teacher/:teacherId/attendance/:classId');
      console.log('');
      console.log('STUDENT:');
      console.log('  POST /api/student/attendance');
      console.log('  GET  /api/student/:studentId/attendance');
      console.log('=================================');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
  pool.end();
  console.log('✅ MySQL connection closed');
  process.exit(0);
});