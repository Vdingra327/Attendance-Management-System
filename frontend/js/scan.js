// scan.js - QR Code Scanner Logic

const API_BASE_URL = 'http://localhost:3000/api';
let selectedStudentId = null;
let html5QrCode = null;
let isScanning = false;

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

    // Scroll to top to show alert
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        // Add event listener
        studentSelect.addEventListener('change', function() {
            selectedStudentId = this.value;
            if (selectedStudentId && !isScanning) {
                startScanner();
            }
        });

    } catch (error) {
        showAlert('Error loading students: ' + error.message, 'error');
    }
}

// Start QR Code Scanner
function startScanner() {
    if (!selectedStudentId) {
        showAlert('Please select your profile first', 'error');
        return;
    }

    // Initialize scanner if not already initialized
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }

    // Configuration
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    // Start scanning
    html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        onScanSuccess,
        onScanError
    ).then(() => {
        isScanning = true;
        console.log("QR Code scanner started successfully.");
    }).catch(err => {
        console.error("Unable to start scanner:", err);
        showAlert('Camera access denied or not available. Use manual entry below.', 'error');
    });
}

// Handle successful QR scan
function onScanSuccess(decodedText, decodedResult) {
    console.log(`QR Code detected: ${decodedText}`);
    
    // Stop scanning temporarily to prevent multiple scans
    if (html5QrCode && isScanning) {
        html5QrCode.stop().then(() => {
            isScanning = false;
            processQRData(decodedText);
        });
    }
}

// Handle scan error (mostly ignore these - they happen constantly while searching)
function onScanError(errorMessage) {
    // Silently ignore scan errors as they happen frequently while scanning
    // Only log critical errors
    if (errorMessage.includes("NotFoundException") === false) {
        console.log(errorMessage);
    }
}

// Process QR data and mark attendance
async function processQRData(qrDataString) {
    try {
        // Parse QR data
        const qrData = JSON.parse(qrDataString);
        const { token, classId, createdAt } = qrData;

        if (!token || !classId || !createdAt) {
            showAlert('Invalid QR code format', 'error');
            restartScanner();
            return;
        }

        // Show result
        document.getElementById('result').style.display = 'block';
        document.getElementById('resultText').innerHTML = `
            <strong>QR Code Detected!</strong><br>
            Processing attendance...
        `;

        const currentTime = Date.now();

        // Send to backend
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
            showAlert('✅ ' + data.message + ' - Attendance marked successfully!', 'success');
            document.getElementById('resultText').innerHTML = `
                <strong style="color: #48bb78;">✅ Success!</strong><br>
                ${data.message}
            `;

            // Restart scanner after 3 seconds
            setTimeout(() => {
                document.getElementById('result').style.display = 'none';
                restartScanner();
            }, 3000);

        } else {
            showAlert('❌ ' + data.error, 'error');
            document.getElementById('resultText').innerHTML = `
                <strong style="color: #e53e3e;">❌ Error!</strong><br>
                ${data.error || data.message}
            `;

            // Restart scanner after 3 seconds
            setTimeout(() => {
                document.getElementById('result').style.display = 'none';
                restartScanner();
            }, 3000);
        }

    } catch (error) {
        if (error instanceof SyntaxError) {
            showAlert('Invalid QR code format. Please try again.', 'error');
        } else {
            showAlert('Error processing QR code: ' + error.message, 'error');
        }
        
        // Restart scanner
        setTimeout(() => {
            restartScanner();
        }, 2000);
    }
}

// Restart scanner
function restartScanner() {
    if (selectedStudentId) {
        startScanner();
    }
}

// Process manual entry
function processManualEntry() {
    const manualQR = document.getElementById('manualQR').value.trim();
    
    if (!manualQR) {
        showAlert('Please enter QR data', 'error');
        return;
    }

    if (!selectedStudentId) {
        showAlert('Please select your profile first', 'error');
        return;
    }

    processQRData(manualQR);
    document.getElementById('manualQR').value = '';
}

// Load students on page load
window.addEventListener('DOMContentLoaded', () => {
    loadStudents();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (html5QrCode && isScanning) {
        html5QrCode.stop();
    }
});