// studentRoutes.js - Student API Routes

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// POST /api/student/attendance - Mark attendance by scanning QR
router.post('/attendance', studentController.markAttendance);

// GET /api/student/:studentId/attendance - Get student's attendance records
router.get('/:studentId/attendance', studentController.getStudentAttendance);

module.exports = router;