// student.js - Student Dashboard Logic

const API_BASE_URL = 'http://localhost:3000/api';
let selectedStudentId = null;

// Show alert message
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alertClass = type === 'success' ? 'alert-success' : (type === 'error' ? 'alert-error' : 'alert-info');
    
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

// Load students for dropdown
async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        const data = await response.json();

        const students = data.users.filter(u => u.role === 'student');
        const studentSelect = document.getElementById('studentSelect');
        
        studentSelect.innerHTML = '<option value="">-- Select Your Name --</option>';
        
        students.forEach(student => {
            studentSelect.innerHTML += `<option value="${student.id}">${student.name}</option>`;
        });

    } catch (error) {
        showAlert('Error loading students: ' + error.message, 'error');
    }
}

// Load student data
async function loadStudentData() {
    selectedStudentId = document.getElementById('studentSelect').value;

    if (!selectedStudentId) {
        document.getElementById('scanSection').style.display = 'none';
        document.getElementById('attendanceSection').style.display = 'none';
        document.getElementById('attendanceDivider').style.display = 'none';
        return;
    }

    // Show sections
    document.getElementById('scanSection').style.display = 'block';
    document.getElementById('attendanceSection').style.display = 'block';
    document.getElementById('attendanceDivider').style.display = 'block';

    // Load attendance
    loadStudentAttendance();

    // Load classes for test mode
    loadClassesForTest();
}

// Load classes for test mode
async function loadClassesForTest() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/timetable`);
        const data = await response.json();

        const testClassSelect = document.getElementById('testClassSelect');
        testClassSelect.innerHTML = '<option value="">-- Select Class --</option>';

        data.timetable.forEach(classItem => {
            const optionText = `${classItem.subject} - ${formatDate(classItem.class_date)} ${formatTime(classItem.class_time)}`;
            testClassSelect.innerHTML += `<option value="${classItem.id}">${optionText}</option>`;
        });

    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

// Simulate QR scan (for testing)
async function simulateScan() {
    const classId = document.getElementById('testClassSelect').value;

    if (!classId) {
        showAlert('Please select a class to test', 'error');
        return;
    }

    if (!selectedStudentId) {
        showAlert('Please select your profile first', 'error');
        return;
    }

    // Generate a test token (in real app, this comes from QR code)
    const testToken = 'test_token_' + Date.now();
    const currentTime = Date.now();

    try {
        const response = await fetch(`${API_BASE_URL}/student/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: testToken,
                classId: classId,
                studentId: selectedStudentId,
                scannedAt: currentTime
            })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('✅ ' + data.message, 'success');
            // Reload attendance
            setTimeout(() => {
                loadStudentAttendance();
            }, 1000);
        } else {
            showAlert('❌ ' + data.error, 'error');
        }

    } catch (error) {
        showAlert('Error marking attendance: ' + error.message, 'error');
    }
}

// Mark attendance by scanning QR
async function markAttendance() {
    const qrDataInput = document.getElementById('qrData').value.trim();

    if (!qrDataInput) {
        showAlert('Please enter QR code data', 'error');
        return;
    }

    if (!selectedStudentId) {
        showAlert('Please select your profile first', 'error');
        return;
    }

    try {
        // Parse QR data
        const qrData = JSON.parse(qrDataInput);
        const { token, classId, createdAt } = qrData;

        if (!token || !classId || !createdAt) {
            showAlert('Invalid QR code data format', 'error');
            return;
        }

        const currentTime = Date.now();

        const response = await fetch(`${API_BASE_URL}/student/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                classId: classId,
                studentId: selectedStudentId,
                scannedAt: currentTime
            })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('✅ ' + data.message, 'success');
            document.getElementById('qrData').value = '';
            // Reload attendance
            setTimeout(() => {
                loadStudentAttendance();
            }, 1000);
        } else {
            showAlert('❌ ' + data.error, 'error');
        }

    } catch (error) {
        if (error instanceof SyntaxError) {
            showAlert('Invalid QR code format. Please check the data.', 'error');
        } else {
            showAlert('Error marking attendance: ' + error.message, 'error');
        }
    }
}

// Load student's attendance records
async function loadStudentAttendance() {
    if (!selectedStudentId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/student/${selectedStudentId}/attendance`);
        const data = await response.json();

        // Display statistics
        const statsHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${data.stats.total}</h3>
                    <p>Total Classes</p>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);">
                    <h3>${data.stats.present}</h3>
                    <p>Present</p>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <h3>${data.stats.total - data.stats.present}</h3>
                    <p>Absent</p>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <h3>${data.stats.percentage}%</h3>
                    <p>Attendance Rate</p>
                </div>
            </div>
        `;

        document.getElementById('attendanceStats').innerHTML = statsHTML;

        // Display attendance table
        const attendanceTable = document.getElementById('attendanceTable');

        if (data.attendance.length === 0) {
            attendanceTable.innerHTML = '<div class="empty-state"><p>No attendance records yet. Scan QR codes in class to mark attendance.</p></div>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Teacher</th>
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
                    <td>${record.subject}</td>
                    <td>${record.teacher_name}</td>
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
    if (typeof timeString === 'string') {
        return timeString.substring(0, 5);
    }
    return timeString;
}

// Load students on page load
window.addEventListener('DOMContentLoaded', () => {
    loadStudents();
});