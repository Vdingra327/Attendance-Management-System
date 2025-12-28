// teacherRoutes.js - Teacher API Routes

const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// GET /api/teacher/:teacherId/classes - Get teacher's classes
router.get('/:teacherId/classes', teacherController.getTeacherClasses);

// POST /api/teacher/qr/:classId - Generate QR code for a class
router.post('/qr/:classId', teacherController.generateQRCode);

// GET /api/teacher/:teacherId/attendance/:classId - Get class attendance
router.get('/:teacherId/attendance/:classId', teacherController.getClassAttendance);

module.exports = router;