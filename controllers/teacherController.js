// teacherController.js - Teacher Business Logic

const { pool } = require('../database');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Get teacher's scheduled classes
const getTeacherClasses = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const query = `
      SELECT 
        id,
        subject,
        class_date,
        class_time
      FROM timetable
      WHERE teacher_id = ?
      ORDER BY class_date, class_time
    `;

    const [classes] = await pool.query(query, [teacherId]);
    res.json({ classes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate QR code for a class (valid for 30 seconds)
const generateQRCode = async (req, res) => {
  const { classId } = req.params;
  const { teacherId } = req.body;

  try {
    // Verify the class belongs to this teacher
    const [classInfo] = await pool.query(
      'SELECT * FROM timetable WHERE id = ? AND teacher_id = ?',
      [classId, teacherId]
    );

    if (classInfo.length === 0) {
      return res.status(404).json({ error: 'Class not found or unauthorized' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const createdAt = Date.now(); // Current timestamp in milliseconds

    // Store token in database
    await pool.query(
      'INSERT INTO qr_sessions (class_id, token, created_at) VALUES (?, ?, ?)',
      [classId, token, createdAt]
    );

    // Create QR code data (includes token, classId, and timestamp)
    const qrData = JSON.stringify({
      token,
      classId,
      createdAt
    });

    // Generate QR code image (base64)
    const qrCodeImage = await QRCode.toDataURL(qrData);

    res.json({
      message: 'QR code generated successfully',
      qrCode: qrCodeImage,
      expiresIn: 30, // seconds
      validUntil: createdAt + 30000 // 30 seconds from now
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get attendance for teacher's specific class
const getClassAttendance = async (req, res) => {
  const { classId, teacherId } = req.params;

  try {
    // Verify the class belongs to this teacher
    const [classInfo] = await pool.query(
      'SELECT * FROM timetable WHERE id = ? AND teacher_id = ?',
      [classId, teacherId]
    );

    if (classInfo.length === 0) {
      return res.status(404).json({ error: 'Class not found or unauthorized' });
    }

    // Get attendance records
    const query = `
      SELECT 
        a.id,
        a.status,
        FROM_UNIXTIME(a.timestamp/1000) as attendance_time,
        u.name as student_name,
        u.id as student_id
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.class_id = ?
      ORDER BY u.name
    `;

    const [attendance] = await pool.query(query, [classId]);
    
    // Get total student count
    const [studentCount] = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE role = "student"'
    );

    res.json({
      attendance,
      stats: {
        present: attendance.filter(a => a.status === 'present').length,
        total: studentCount[0].total
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export all controller functions
module.exports = {
  getTeacherClasses,
  generateQRCode,
  getClassAttendance
};