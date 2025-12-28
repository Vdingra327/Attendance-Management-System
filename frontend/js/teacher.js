// teacher.js - Teacher Dashboard Logic

const API_BASE_URL = 'http://localhost:3000/api';
let selectedTeacherId = null;
let countdownInterval = null;

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

// Load teachers for dropdown
async function loadTeachers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        const data = await response.json();

        const teachers = data.users.filter(u => u.role === 'teacher');
        const teacherSelect = document.getElementById('teacherSelect');
        
        teacherSelect.innerHTML = '<option value="">-- Select Your Name --</option>';
        
        teachers.forEach(teacher => {
            teacherSelect.innerHTML += `<option value="${teacher.id}">${teacher.name}</option>`;
        });

    } catch (error) {
        showAlert('Error loading teachers: ' + error.message, 'error');
    }
}

// Load teacher's classes
async function loadTeacherClasses() {
    selectedTeacherId = document.getElementById('teacherSelect').value;

    if (!selectedTeacherId) {
        document.getElementById('classesSection').style.display = 'none';
        document.getElementById('qrSection').style.display = 'none';
        document.getElementById('qrDivider').style.display = 'none';
        document.getElementById('attendanceSection').style.display = 'none';
        document.getElementById('attendanceDivider').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/teacher/${selectedTeacherId}/classes`);
        const data = await response.json();

        const classesTable = document.getElementById('classesTable');
        const classesSection = document.getElementById('classesSection');

        classesSection.style.display = 'block';

        if (data.classes.length === 0) {
            classesTable.innerHTML = '<div class="empty-state"><p>No classes assigned yet. Contact admin to assign classes.</p></div>';
            document.getElementById('qrSection').style.display = 'none';
            document.getElementById('qrDivider').style.display = 'none';
            document.getElementById('attendanceSection').style.display = 'none';
            document.getElementById('attendanceDivider').style.display = 'none';
            return;
        }

        // Display classes in table
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.classes.forEach(classItem => {
            tableHTML += `
                <tr>
                    <td>${classItem.id}</td>
                    <td>${classItem.subject}</td>
                    <td>${formatDate(classItem.class_date)}</td>
                    <td>${formatTime(classItem.class_time)}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        classesTable.innerHTML = tableHTML;

        // Populate class dropdowns
        populateClassDropdowns(data.classes);

        // Show QR and attendance sections
        document.getElementById('qrSection').style.display = 'block';
        document.getElementById('qrDivider').style.display = 'block';
        document.getElementById('attendanceSection').style.display = 'block';
        document.getElementById('attendanceDivider').style.display = 'block';

    } catch (error) {
        showAlert('Error loading classes: ' + error.message, 'error');
    }
}

// Populate class selection dropdowns
function populateClassDropdowns(classes) {
    const classSelect = document.getElementById('classSelect');
    const attendanceClassSelect = document.getElementById('attendanceClassSelect');

    classSelect.innerHTML = '<option value="">-- Select Class --</option>';
    attendanceClassSelect.innerHTML = '<option value="">-- Select Class --</option>';

    classes.forEach(classItem => {
        const optionText = `${classItem.subject} - ${formatDate(classItem.class_date)} ${formatTime(classItem.class_time)}`;
        classSelect.innerHTML += `<option value="${classItem.id}">${optionText}</option>`;
        attendanceClassSelect.innerHTML += `<option value="${classItem.id}">${optionText}</option>`;
    });
}

// Generate QR Code
async function generateQR() {
    const classId = document.getElementById('classSelect').value;

    if (!classId) {
        showAlert('Please select a class first', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/teacher/qr/${classId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                teacherId: selectedTeacherId
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Display QR code
            document.getElementById('qrDisplay').style.display = 'block';
            document.getElementById('qrImage').src = data.qrCode;

            // Around line 140, after displaying QR code, add:
            // Also display the raw data for testing
            const qrDataForTesting = JSON.stringify({
            token: 'Will be in actual QR',
            classId: classId,
             createdAt: Date.now()
            });

            console.log('QR Data (for testing):', qrDataForTesting);
            // Start countdown
            startCountdown(30);

            showAlert('QR Code generated successfully!', 'success');
        } else {
            showAlert('Error: ' + data.error, 'error');
        }

    } catch (error) {
        showAlert('Error generating QR code: ' + error.message, 'error');
    }
}

// Start countdown timer
function startCountdown(seconds) {
    // Clear any existing countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    let timeLeft = seconds;
    const countdownElement = document.getElementById('countdown');

    countdownInterval = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('qrDisplay').style.display = 'none';
            showAlert('QR code has expired. Generate a new one.', 'error');
        }
    }, 1000);
}

// Load class attendance
async function loadClassAttendance() {
    const classId = document.getElementById('attendanceClassSelect').value;

    if (!classId) {
        document.getElementById('attendanceDisplay').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/teacher/${selectedTeacherId}/attendance/${classId}`);
        const data = await response.json();

        const attendanceDisplay = document.getElementById('attendanceDisplay');

        // Display statistics
        let html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${data.stats.present}</h3>
                    <p>Present</p>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <h3>${data.stats.total - data.stats.present}</h3>
                    <p>Absent</p>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                    <h3>${data.stats.total}</h3>
                    <p>Total Students</p>
                </div>
            </div>
        `;

        if (data.attendance.length === 0) {
            html += '<div class="empty-state"><p>No attendance marked yet for this class</p></div>';
        } else {
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Status</th>
                            <th>Marked At</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.attendance.forEach(record => {
                const statusColor = record.status === 'present' ? '#48bb78' : '#e53e3e';
                html += `
                    <tr>
                        <td>${record.student_name}</td>
                        <td><span style="background: ${statusColor}; color: white; padding: 5px 15px; border-radius: 20px;">${record.status.toUpperCase()}</span></td>
                        <td>${record.attendance_time}</td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
        }

        attendanceDisplay.innerHTML = html;

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

// Load teachers on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTeachers();
});