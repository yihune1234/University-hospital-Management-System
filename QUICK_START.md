# Quick Start Guide - University Clinic Management System

## 🚀 Get Up and Running in 5 Minutes

---

## Prerequisites

- ✅ Node.js installed (v14 or higher)
- ✅ MySQL installed and running
- ✅ Git (optional, for cloning)

---

## Step 1: Database Setup (2 minutes)

### A. Create Database
```sql
-- Open MySQL command line or MySQL Workbench
CREATE DATABASE University_Clinic_Management_System;
```

### B. Configure Database Connection
```bash
# Navigate to backend folder
cd backend

# Edit .env file (or create if doesn't exist)
# Update these values:
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=University_Clinic_Management_System
DB_PORT=3306
PORT=3000
JWT_SECRET=your_very_long_and_secure_secret_key_change_this_in_production
JWT_EXPIRATION=24h
```

---

## Step 2: Backend Setup (1 minute)

```bash
# In backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

**Expected Output:**
```
✓ Server running on port 3000
✓ Database connected successfully
✓ Tables created/verified
```

**Keep this terminal open!**

---

## Step 3: Frontend Setup (1 minute)

```bash
# Open NEW terminal
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
VITE v4.x.x ready in XXX ms
➜ Local: http://localhost:5173/
```

**Keep this terminal open too!**

---

## Step 4: Access the System (1 minute)

### Open Browser
Go to: **http://localhost:5173**

### Login with Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@university.edu | password123 |
| **Receptionist** | reception@university.edu | password123 |
| **Doctor** | doctor@university.edu | password123 |
| **Nurse** | nurse@university.edu | password123 |
| **Lab Tech** | labtech@university.edu | password123 |
| **Pharmacist** | pharmacist@university.edu | password123 |

---

## Step 5: Test Key Features

### A. Test Queue Management (Receptionist)

1. **Login as Receptionist**
   - Email: `reception@university.edu`
   - Password: `password123`

2. **Add Patient to Queue**
   - Click **"Patient Management"** in sidebar
   - Click **"Show All"** to see patients
   - Click **"➕ Add to Queue"** on any patient
   - Fill form:
     - Select any Clinic
     - Select any Doctor
     - Click **"✅ Add to Queue"**
   - ✅ Success! Patient added with queue number

3. **View Queue**
   - Click **"Queue Management"** in sidebar
   - Select clinic from dropdown
   - ✅ See patient in queue with number #1, #2, etc.

4. **Call Next Patient**
   - Click **"📢 Call Next Patient"** button
   - ✅ Alert shows patient name and queue number
   - ✅ Status changes to "In-Service"

5. **Complete Service**
   - Click **"✅ Complete"** button
   - ✅ Status changes to "Completed"

### B. Test Reports (Admin)

1. **Logout and Login as Admin**
   - Click logout
   - Login: `admin@university.edu` / `password123`

2. **View Dashboard Overview**
   - Click **"Reports & Analytics"** in sidebar
   - Click **"Dashboard Overview"**
   - ✅ See all metrics (patients, financial, appointments, etc.)

3. **View Specific Reports**
   - Click **"Patient Reports"**
   - ✅ See patient statistics and demographics
   - Click **"Financial Reports"**
   - ✅ See revenue and billing data
   - Click **"Appointment Reports"**
   - ✅ See appointment trends

4. **Export Report**
   - In any report, click **"📥 Export"**
   - ✅ CSV file downloads

---

## Troubleshooting

### Backend Won't Start

**Error: "Cannot connect to database"**
```bash
# Check MySQL is running
# Windows: Check Services
# Mac: brew services list
# Linux: sudo systemctl status mysql

# Verify credentials in backend/.env
# Make sure DB_PASS matches your MySQL password
```

**Error: "Port 3000 already in use"**
```bash
# Change port in backend/.env
PORT=3001

# Or kill process using port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill
```

### Frontend Won't Start

**Error: "Port 5173 already in use"**
```bash
# Vite will automatically try next port (5174)
# Or specify port in vite.config.js
```

**Error: "Cannot connect to backend"**
```bash
# Check backend is running on port 3000
# Check frontend/.env has correct API URL
VITE_API_URL=http://localhost:3000/api
```

### Login Fails

**Error: "Invalid credentials"**
```bash
# Make sure you're using correct test credentials
# Email: admin@university.edu
# Password: password123

# Check backend console for errors
# Verify JWT_SECRET is set in backend/.env
```

### Queue Not Working

**No patients showing in queue**
```bash
# Make sure you added patient to queue today
# Queue numbers reset daily
# Try adding a new patient to queue
```

**Cannot add to queue**
```bash
# Verify clinic and doctor exist in database
# Check backend console for errors
# Make sure appointment was created successfully
```

---

## What's Working

### ✅ Fully Integrated Features

1. **Patient Management**
   - Search patients
   - View patient details
   - Add to queue with one click

2. **Queue Management**
   - Auto-incrementing queue numbers (1, 2, 3...)
   - Real-time statistics
   - Call next patient
   - Status tracking (Waiting → In-Service → Completed)
   - Auto-refresh every 30 seconds

3. **Reports & Analytics**
   - Dashboard overview (all metrics)
   - Patient reports (demographics, registrations, visits)
   - Financial reports (revenue, payments, outstanding)
   - Appointment reports (trends, no-shows, wait times)
   - Staff reports (performance, utilization)
   - Audit logs (system activities)
   - Export to CSV

4. **All Role Dashboards**
   - Admin: Full system management
   - Receptionist: Patient & queue management
   - Nurse: Vitals & patient queue
   - Doctor: Consultations & prescriptions
   - Lab Tech: Test processing
   - Pharmacist: Dispensing & inventory

---

## Next Steps

### For Testing
1. ✅ Create test patients
2. ✅ Add patients to queue
3. ✅ Test queue flow
4. ✅ Generate reports
5. ✅ Test all role dashboards

### For Production
1. 🔄 Change all default passwords
2. 🔄 Update JWT_SECRET to secure value
3. 🔄 Configure production database
4. 🔄 Set up SSL/HTTPS
5. 🔄 Deploy to production server
6. 🔄 Set up automated backups

---

## Useful Commands

### Backend
```bash
# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Test database connection
node test-db-connection.js

# Check environment variables
node check-env.js
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database
```bash
# Backup database
mysqldump -u root -p University_Clinic_Management_System > backup.sql

# Restore database
mysql -u root -p University_Clinic_Management_System < backup.sql

# Check tables
mysql -u root -p -e "USE University_Clinic_Management_System; SHOW TABLES;"
```

---

## Documentation

### 📚 Available Guides

1. **SYSTEM_USER_GUIDE.md** - Complete user manual
   - Role-based workflows
   - Step-by-step instructions
   - Troubleshooting
   - Best practices

2. **COMPLETE_INTEGRATION_STATUS.md** - Technical integration details
   - All endpoints
   - File structure
   - Verification steps
   - API examples

3. **QUEUE_MANAGEMENT_COMPLETE.md** - Queue system details
   - How queue works
   - Auto-numbering logic
   - Status flow
   - API usage

4. **ADMIN_REPORTS_COMPLETE.md** - Reports system details
   - All report types
   - Query parameters
   - Export functionality
   - Performance tips

5. **API_ENDPOINTS.md** - API reference
   - All available endpoints
   - Request/response formats
   - Authentication

---

## Support

### Getting Help

1. **Check Documentation** - Most answers are in the guides above
2. **Check Console** - Browser console and terminal show errors
3. **Check Logs** - Backend console shows detailed errors
4. **Test Endpoints** - Use curl or Postman to test API directly

### Common Questions

**Q: How do I add more users?**
A: Login as Admin → Staff Management → Add Staff

**Q: How do I add more clinics?**
A: Login as Admin → Clinic Management → Add Clinic

**Q: How do I reset queue numbers?**
A: Queue numbers reset automatically each day at midnight

**Q: How do I export data?**
A: Use Reports module → Select report → Click Export button

**Q: How do I change my password?**
A: Currently requires admin to update in database (feature coming soon)

---

## System Requirements

### Minimum
- Node.js 14+
- MySQL 5.7+
- 2GB RAM
- Modern browser (Chrome, Firefox, Edge, Safari)

### Recommended
- Node.js 18+
- MySQL 8.0+
- 4GB RAM
- Chrome or Firefox (latest version)

---

## Success Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can login as any role
- [ ] Can search patients
- [ ] Can add patient to queue
- [ ] Can see queue with numbers
- [ ] Can call next patient
- [ ] Can view reports
- [ ] Can export reports
- [ ] No console errors

**If all checked: ✅ System is working perfectly!**

---

## Quick Reference

### URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Database: localhost:3306

### Default Ports
- Frontend: 5173
- Backend: 3000
- MySQL: 3306

### Key Folders
- Backend code: `backend/`
- Frontend code: `frontend/src/`
- Documentation: Root folder (*.md files)

---

**🎉 Congratulations! Your system is ready to use!**

For detailed workflows and features, see **SYSTEM_USER_GUIDE.md**

For technical details, see **COMPLETE_INTEGRATION_STATUS.md**
