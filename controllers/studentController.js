// studentController.js - Student Business Logic

const { pool } = require('../database');

// Mark attendance by scanning QR code
const markAttendance = async (req, res) => {
  const { token, classId, studentId, scannedAt } = req.body;

  // Validate input
  if (!token || !classId || !studentId || !scannedAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify student exists
    const [student] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND role = "student"',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify QR token exists and get creation time
    const [session] = await pool.query(
      'SELECT * FROM qr_sessions WHERE token = ? AND class_id = ?',
      [token, classId]
    );

    if (session.length === 0) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    const qrCreatedAt = session[0].created_at;
    const qrExpiry = qrCreatedAt + 30000; // 30 seconds validity

    // Check if QR code has expired
    if (scannedAt > qrExpiry) {
      return res.status(400).json({ 
        error: 'QR code has expired',
        message: 'This QR code is no longer valid. Please ask your teacher to generate a new one.'
      });
    }

    // Check if attendance already marked
    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE student_id = ? AND class_id = ?',
      [studentId, classId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        error: 'Attendance already marked',
        message: 'Your attendance for this class has already been recorded.'
      });
    }

    // Mark attendance as present
    await pool.query(
      'INSERT INTO attendance (student_id, class_id, status, timestamp) VALUES (?, ?, ?, ?)',
      [studentId, classId, 'present', scannedAt]
    );

    res.status(201).json({
      message: 'Attendance marked successfully',
      status: 'present'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student's attendance records
const getStudentAttendance = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Verify student exists
    const [student] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND role = "student"',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get attendance records with class details
    const query = `
      SELECT 
        a.id,
        a.status,
        FROM_UNIXTIME(a.timestamp/1000) as attendance_time,
        t.subject,
        t.class_date,
        t.class_time,
        u.name as teacher_name
      FROM attendance a
      JOIN timetable t ON a.class_id = t.id
      JOIN users u ON t.teacher_id = u.id
      WHERE a.student_id = ?
      ORDER BY t.class_date DESC, t.class_time DESC
    `;

    const [attendance] = await pool.query(query, [studentId]);

    // Calculate statistics
    const totalClasses = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalClasses > 0 
      ? ((presentCount / totalClasses) * 100).toFixed(2)
      : 0;

    res.json({
      attendance,
      stats: {
        total: totalClasses,
        present: presentCount,
        percentage: attendancePercentage
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export all controller functions
module.exports = {
  markAttendance,
  getStudentAttendance
};