// adminRoutes.js - Admin API Routes

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// GET /api/admin/users - Get all users
router.get('/users', adminController.getAllUsers);

// GET /api/admin/timetable - Get all timetable entries
router.get('/timetable', adminController.getAllTimetable);

// POST /api/admin/timetable - Create new timetable entry
router.post('/timetable', adminController.createTimetable);

// GET /api/admin/attendance - Get all attendance records
router.get('/attendance', adminController.getAllAttendance);

// GET /api/admin/attendance/:classId - Get attendance for specific class
router.get('/attendance/:classId', adminController.getClassAttendance);

module.exports = router;