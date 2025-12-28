// admin.js - Admin Dashboard Logic

const API_BASE_URL = 'http://localhost:3000/api';

// Show alert message
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    
    alertContainer.innerHTML = `
        <div class="alert ${alertClass}">
            ${message}
        </div>
    `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// Load all users
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        const data = await response.json();

        const usersTable = document.getElementById('usersTable');

        if (data.users.length === 0) {
            usersTable.innerHTML = '<div class="empty-state"><p>No users found</p></div>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.users.forEach(user => {
            tableHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td><span style="background: ${getRoleColor(user.role)}; color: white; padding: 5px 15px; border-radius: 20px;">${user.role.toUpperCase()}</span></td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        usersTable.innerHTML = tableHTML;

        // Populate teacher dropdown
        populateTeacherDropdown(data.users.filter(u => u.role === 'teacher'));

    } catch (error) {
        showAlert('Error loading users: ' + error.message, 'error');
    }
}

// Populate teacher dropdown
function populateTeacherDropdown(teachers) {
    const teacherSelect = document.getElementById('teacherSelect');
    teacherSelect.innerHTML = '<option value="">-- Select Teacher --</option>';

    teachers.forEach(teacher => {
        teacherSelect.innerHTML += `<option value="${teacher.id}">${teacher.name}</option>`;
    });
}

// Get role color
function getRoleColor(role) {
    switch(role) {
        case 'admin': return '#667eea';
        case 'teacher': return '#48bb78';
        case 'student': return '#4299e1';
        default: return '#718096';
    }
}

// Load timetable
async function loadTimetable() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/timetable`);
        const data = await response.json();

        const timetableTable = document.getElementById('timetableTable');

        if (data.timetable.length === 0) {
            timetableTable.innerHTML = '<div class="empty-state"><p>No timetable entries yet. Create one above!</p></div>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.timetable.forEach(entry => {
            tableHTML += `
                <tr>
                    <td>${entry.id}</td>
                    <td>${entry.subject}</td>
                    <td>${entry.teacher_name}</td>
                    <td>${formatDate(entry.class_date)}</td>
                    <td>${formatTime(entry.class_time)}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        timetableTable.innerHTML = tableHTML;

    } catch (error) {
        showAlert('Error loading timetable: ' + error.message, 'error');
    }
}

// Load attendance records
async function loadAttendance() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/attendance`);
        const data = await response.json();

        const attendanceTable = document.getElementById('attendanceTable');

        if (data.attendance.length === 0) {
            attendanceTable.innerHTML = '<div class="empty-state"><p>No attendance records yet</p></div>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Marked At</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.attendance.forEach(record => {
            const statusColor = record.status === 'present' ? '#48bb78' : '#e53e3e';
            tableHTML += `
                <tr>
                    <td>${record.student_name}</td>
                    <td>${record.subject}</td>
                    <td>${formatDate(record.class_date)}</td>
                    <td>${formatTime(record.class_time)}</td>
                    <td><span style="background: ${statusColor}; color: white; padding: 5px 15px; border-radius: 20px;">${record.status.toUpperCase()}</span></td>
                    <td>${record.attendance_time}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        attendanceTable.innerHTML = tableHTML;

    } catch (error) {
        showAlert('Error loading attendance: ' + error.message, 'error');
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Format time
function formatTime(timeString) {
    // Handle both "HH:MM:SS" and time objects
    if (typeof timeString === 'string') {
        return timeString.substring(0, 5); // Get HH:MM
    }
    return timeString;
}

// Handle timetable form submission
document.getElementById('timetableForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const teacherId = document.getElementById('teacherSelect').value;
    const subject = document.getElementById('subject').value;
    const classDate = document.getElementById('classDate').value;
    const classTime = document.getElementById('classTime').value + ':00'; // Add seconds

    try {
        const response = await fetch(`${API_BASE_URL}/admin/timetable`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                teacher_id: teacherId,
                subject: subject,
                class_date: classDate,
                class_time: classTime
            })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Timetable entry created successfully!', 'success');
            
            // Reset form
            document.getElementById('timetableForm').reset();
            
            // Reload timetable
            loadTimetable();
        } else {
            showAlert('Error: ' + data.error, 'error');
        }

    } catch (error) {
        showAlert('Error creating timetable: ' + error.message, 'error');
    }
});

// Load data on page load
window.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadTimetable();
    loadAttendance();
});