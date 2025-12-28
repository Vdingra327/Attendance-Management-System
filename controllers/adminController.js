// adminController.js - Admin Business Logic

const { pool } = require('../database');

// Get all users (admin, teachers, students)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, role FROM users');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all timetable entries with teacher details
const getAllTimetable = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id,
        t.subject,
        t.class_date,
        t.class_time,
        u.name as teacher_name,
        u.id as teacher_id
      FROM timetable t
      JOIN users u ON t.teacher_id = u.id
      ORDER BY t.class_date, t.class_time
    `;
    
    const [timetable] = await pool.query(query);
    res.json({ timetable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new timetable entry
const createTimetable = async (req, res) => {
  const { teacher_id, subject, class_date, class_time } = req.body;

  // Validate input
  if (!teacher_id || !subject || !class_date || !class_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if teacher exists
    const [teacher] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND role = "teacher"',
      [teacher_id]
    );

    if (teacher.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Insert timetable entry
    const [result] = await pool.query(
      'INSERT INTO timetable (teacher_id, subject, class_date, class_time) VALUES (?, ?, ?, ?)',
      [teacher_id, subject, class_date, class_time]
    );

    res.status(201).json({
      message: 'Timetable entry created successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all attendance records with student and class details
const getAllAttendance = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.status,
        FROM_UNIXTIME(a.timestamp/1000) as attendance_time,
        u.name as student_name,
        u.id as student_id,
        t.subject,
        t.class_date,
        t.class_time
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN timetable t ON a.class_id = t.id
      ORDER BY a.timestamp DESC
    `;

    const [attendance] = await pool.query(query);
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get attendance for a specific class
const getClassAttendance = async (req, res) => {
  const { classId } = req.params;

  try {
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
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export all controller functions
module.exports = {
  getAllUsers,
  getAllTimetable,
  createTimetable,
  getAllAttendance,
  getClassAttendance
};