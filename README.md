# 🎓 Attendance Management System

A full-stack web-based attendance management system with QR code scanning functionality. Built as a beginner-friendly project to learn full-stack development.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 👨‍💼 Admin Features
- View all users (Admin, Teachers, Students)
- Create and manage timetable entries
- Assign classes to teachers
- View all attendance records across the system
- Real-time statistics and reporting

### 👨‍🏫 Teacher Features
- View assigned classes and schedules
- Generate time-limited QR codes (30-second validity)
- Real-time countdown timer for QR codes
- View class-wise attendance statistics
- Track present/absent students

### 👨‍🎓 Student Features
- Scan QR codes using phone camera
- Mark attendance in real-time
- View personal attendance history
- See attendance percentage and statistics
- Fallback manual entry option

### 🔐 Security Features
- Time-limited QR codes (30 seconds expiry)
- Backend validation of QR tokens and timestamps
- Duplicate attendance prevention
- Secure token generation using crypto

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **QR Code:** qrcode (npm package)
- **Other:** cors, mysql2

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No frameworks
- **QR Scanner:** html5-qrcode library

### Development Tools
- **VS Code** - Code editor
- **Live Server** - Frontend development server
- **MySQL Workbench** - Database management
- **Git** - Version control

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/attendance-system.git
cd attendance-system
```

### 2. Database Setup

Open MySQL Workbench or MySQL command line and run:
```sql
CREATE DATABASE attendance_system;
```

### 3. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure database connection
# Open database.js and update the following:
# - host: 'localhost'
# - user: 'root'
# - password: 'YOUR_MYSQL_PASSWORD'
# - database: 'attendance_system'
```

### 4. Start Backend Server
```bash
# Make sure you're in the backend folder
npm start
```

You should see:
```
✅ MySQL connection pool created
✅ Connected to MySQL database
🔄 Creating tables...
✅ Users table ready
✅ Timetable table ready
✅ QR Sessions table ready
✅ Attendance table ready
✅ Sample users inserted
=================================
🚀 Server is running!
📍 URL: http://localhost:3000
=================================
```

### 5. Frontend Setup
```bash
# Open a new terminal
# Navigate to frontend folder
cd frontend

# Install Live Server extension in VS Code
# Or use any static file server
```

**Using VS Code Live Server:**
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Frontend will open at `http://localhost:5500`

---

## 💻 Usage

### Admin Workflow

1. Open `http://localhost:5500`
2. Click **"Login as Admin"**
3. View all users (6 sample users pre-loaded)
4. Create a timetable entry:
   - Select teacher from dropdown
   - Enter subject name
   - Pick date and time
   - Click "Create Timetable Entry"
5. View timetable and attendance records

### Teacher Workflow

1. Go to home page, click **"Login as Teacher"**
2. Select your name (John Smith or Sarah Johnson)
3. View your assigned classes
4. Generate QR code:
   - Select a class
   - Click "Generate QR Code"
   - QR appears with 30-second countdown
5. Students can now scan the QR code
6. View attendance statistics for your classes

### Student Workflow

#### Option 1: Real QR Scanning (Phone)
1. On your phone, go to `http://YOUR_COMPUTER_IP:5500/pages/scan.html`
   - Find computer IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Example: `http://192.168.1.100:5500/pages/scan.html`
2. Select your name
3. Allow camera access
4. Point camera at teacher's QR code
5. Attendance marked automatically!

#### Option 2: Test Mode (No Camera)
1. Click **"Login as Student"**
2. Select your name
3. Use "Test Mode" to simulate scanning
4. View your attendance records and statistics

---

## 📁 Project Structure
```
attendance-system/
│
├── backend/
│   ├── controllers/
│   │   ├── adminController.js      # Admin business logic
│   │   ├── teacherController.js    # Teacher business logic
│   │   └── studentController.js    # Student business logic
│   │
│   ├── routes/
│   │   ├── adminRoutes.js          # Admin API endpoints
│   │   ├── teacherRoutes.js        # Teacher API endpoints
│   │   └── studentRoutes.js        # Student API endpoints
│   │
│   ├── database.js                 # MySQL connection & setup
│   ├── server.js                   # Express server
│   ├── package.json                # Dependencies
│   └── package-lock.json
│
├── frontend/
│   ├── pages/
│   │   ├── admin.html              # Admin dashboard
│   │   ├── teacher.html            # Teacher dashboard
│   │   ├── student.html            # Student dashboard
│   │   └── scan.html               # QR code scanner
│   │
│   ├── js/
│   │   ├── admin.js                # Admin functionality
│   │   ├── teacher.js              # Teacher functionality
│   │   ├── student.js              # Student functionality
│   │   └── scan.js                 # QR scanner logic
│   │
│   ├── css/
│   │   └── style.css               # Global styles
│   │
│   └── index.html                  # Landing page
│
├── README.md                        # Project documentation
└── .gitignore                       # Git ignore file
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Get all users |
| GET | `/admin/timetable` | Get all timetable entries |
| POST | `/admin/timetable` | Create new timetable entry |
| GET | `/admin/attendance` | Get all attendance records |
| GET | `/admin/attendance/:classId` | Get attendance for specific class |

### Teacher Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/teacher/:teacherId/classes` | Get teacher's classes |
| POST | `/teacher/qr/:classId` | Generate QR code for class |
| GET | `/teacher/:teacherId/attendance/:classId` | Get class attendance |

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/student/attendance` | Mark attendance via QR scan |
| GET | `/student/:studentId/attendance` | Get student's attendance records |

### Sample API Requests

#### Create Timetable Entry
```javascript
POST /api/admin/timetable
Content-Type: application/json

{
  "teacher_id": 2,
  "subject": "Mathematics",
  "class_date": "2025-01-15",
  "class_time": "10:00:00"
}
```

#### Mark Attendance
```javascript
POST /api/student/attendance
Content-Type: application/json

{
  "token": "abc123...",
  "classId": 1,
  "studentId": 4,
  "scannedAt": 1704441600000
}
```

---

## 🗄️ Database Schema

### users
```sql
id          INT PRIMARY KEY AUTO_INCREMENT
name        VARCHAR(255) NOT NULL
role        ENUM('admin', 'teacher', 'student') NOT NULL
```

### timetable
```sql
id          INT PRIMARY KEY AUTO_INCREMENT
teacher_id  INT NOT NULL
subject     VARCHAR(255) NOT NULL
class_date  DATE NOT NULL
class_time  TIME NOT NULL
FOREIGN KEY (teacher_id) REFERENCES users(id)
```

### qr_sessions
```sql
id          INT PRIMARY KEY AUTO_INCREMENT
class_id    INT NOT NULL
token       VARCHAR(255) NOT NULL UNIQUE
created_at  BIGINT NOT NULL
FOREIGN KEY (class_id) REFERENCES timetable(id)
```

### attendance
```sql
id          INT PRIMARY KEY AUTO_INCREMENT
student_id  INT NOT NULL
class_id    INT NOT NULL
status      ENUM('present', 'absent') NOT NULL
timestamp   BIGINT NOT NULL
UNIQUE KEY (student_id, class_id)
FOREIGN KEY (student_id) REFERENCES users(id)
FOREIGN KEY (class_id) REFERENCES timetable(id)
```

---
## 🔮 Future Enhancements

- [ ] Add user authentication (login/password)
- [ ] Email notifications for low attendance
- [ ] Export attendance reports to PDF/Excel
- [ ] SMS alerts for absent students
- [ ] Location-based attendance verification (GPS)
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Attendance analytics dashboard
- [ ] Biometric integration
- [ ] Parent portal to view child's attendance

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Vdingra327](https://github.com/Vdingra327)
- Email: dhingravansh327@example.com

---

## 🙏 Acknowledgments

- Built as a learning project for full-stack development
- Inspired by real-world attendance management needs
- Thanks to the open-source community for amazing libraries

---

## 📞 Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/Vdingra327/attendance-system/issues) page
2. Create a new issue with detailed description
3. Contact via email: dhingravansh327@example.com

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you learn something new!

---

**Happy Coding! 🚀**
