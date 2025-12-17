# University Clinic Management System - Deployment Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Maintenance](#maintenance)
8. [Backup & Recovery](#backup--recovery)

---

## System Requirements

### Hardware Requirements

#### Minimum (Development/Testing)
- **CPU:** 2 cores, 2.0 GHz
- **RAM:** 4 GB
- **Storage:** 20 GB available space
- **Network:** Stable internet connection

#### Recommended (Production)
- **CPU:** 4+ cores, 2.5+ GHz
- **RAM:** 8+ GB
- **Storage:** 100+ GB SSD
- **Network:** High-speed internet, dedicated server

### Software Requirements

#### Backend
- **Node.js:** v16.x or higher
- **npm:** v8.x or higher
- **MySQL:** v8.0 or higher
- **Operating System:** Windows, Linux, or macOS

#### Frontend
- **Node.js:** v16.x or higher
- **npm:** v8.x or higher
- **Modern Web Browser:** Chrome, Firefox, Edge, Safari (latest versions)

---

## Installation Steps

### Step 1: Install Prerequisites

#### Install Node.js
**Windows:**
1. Download from https://nodejs.org/
2. Run installer
3. Follow installation wizard
4. Verify: `node --version` and `npm --version`

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

**macOS:**
```bash
brew install node
node --version
npm --version
```

#### Install MySQL
**Windows:**
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run installer
3. Choose "Developer Default"
4. Set root password (remember this!)
5. Complete installation

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Step 2: Clone/Download Project

**Option A: Using Git**
```bash
git clone <repository-url>
cd university-clinic-management-system
```

**Option B: Download ZIP**
1. Download project ZIP file
2. Extract to desired location
3. Open terminal/command prompt in project folder

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected output:**
```
added 150+ packages in 30s
```

### Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**Expected output:**
```
added 1200+ packages in 60s
```

---

## Configuration

### Backend Configuration

#### 1. Create Environment File
```bash
cd backend
cp .env.example .env
```

Or create new `.env` file with:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=University_Clinic_Management_System
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_secret_key_change_this_in_production
JWT_EXPIRATION=24h

# CORS Configuration (Frontend URL)
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANT:**
- Replace `your_mysql_password` with your actual MySQL root password
- Change `JWT_SECRET` to a long, random string in production
- Update `FRONTEND_URL` if using different port

#### 2. Verify Configuration
```bash
node check-env.js
```

**Expected output:**
```
✓ All required environment variables are set
✓ Database connection successful
```

### Frontend Configuration

#### 1. Create Environment File
```bash
cd frontend
cp .env.example .env
```

Or create new `.env` file with:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=University Clinic Management System
VITE_APP_VERSION=1.0.0
```

**⚠️ IMPORTANT:**
- Update `VITE_API_URL` if backend runs on different port
- In production, use your actual domain

---

## Database Setup

### Option 1: Automatic Setup (Recommended)

The system automatically creates database and tables on first run.

```bash
cd backend
npm start
```

**Expected output:**
```
✓ Database created: University_Clinic_Management_System
✓ All tables created successfully
✓ Server running on port 3000
```

### Option 2: Manual Setup

#### 1. Login to MySQL
```bash
mysql -u root -p
```

#### 2. Create Database
```sql
CREATE DATABASE University_Clinic_Management_System 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE University_Clinic_Management_System;
```

#### 3. Run Schema File
```bash
mysql -u root -p University_Clinic_Management_System < backend/config/schema.sql
```

#### 4. Verify Tables Created
```sql
SHOW TABLES;
```

**Expected output:**
```
+------------------------------------------+
| Tables_in_University_Clinic_Management  |
+------------------------------------------+
| appointments                             |
| audit_logs                               |
| billing                                  |
| campuses                                 |
| clinics                                  |
| lab_requests                             |
| medical_records                          |
| notifications                            |
| patients                                 |
| pharmacy_inventory                       |
| prescriptions                            |
| referrals                                |
| roles                                    |
| staff                                    |
| staff_schedules                          |
| vitals                                   |
| waiting_queue                            |
| work_areas                               |
+------------------------------------------+
```

### Seed Initial Data

#### 1. Create Admin User
```bash
cd backend
node create-admin.js
```

**Expected output:**
```
✓ Admin user created successfully
Email: admin@university.edu
Password: password123
⚠️ Please change password after first login
```

#### 2. Seed Pharmacy Data (Optional)
```bash
mysql -u root -p University_Clinic_Management_System < backend/seed-pharmacy.sql
```

#### 3. Create Sample Data (Optional)
```bash
node seed-sample-data.js
```

---

## Running the Application

### Development Mode

#### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

**Expected output:**
```
[nodemon] starting `node start.js`
✓ Database connected
✓ Server running on http://localhost:3000
✓ Environment: development
```

#### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v4.x.x ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.x:5173/
```

#### Access Application
Open browser and navigate to: **http://localhost:5173**

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
```

**Expected output:**
```
✓ built in 15s
dist/index.html                  1.2 kB
dist/assets/index-abc123.js      450 kB
dist/assets/index-def456.css     50 kB
```

#### Start Backend (Production)
```bash
cd backend
NODE_ENV=production npm start
```

---

## Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Prepare Server
- Ubuntu 20.04+ or similar
- Install Node.js, MySQL, Nginx
- Configure firewall

#### 2. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### 3. Clone Project
```bash
cd /var/www
sudo git clone <repository-url> clinic-system
cd clinic-system
```

#### 4. Setup Backend
```bash
cd backend
npm install --production
cp .env.example .env
nano .env  # Edit configuration
```

**Production .env:**
```env
DB_HOST=localhost
DB_USER=clinic_user
DB_PASS=secure_password_here
DB_NAME=University_Clinic_Management_System
DB_PORT=3306

PORT=3000
NODE_ENV=production

JWT_SECRET=very_long_random_string_change_this
JWT_EXPIRATION=24h

FRONTEND_URL=https://yourdomain.com
```

#### 5. Setup Database
```bash
# Create database user
sudo mysql -u root -p

CREATE USER 'clinic_user'@'localhost' IDENTIFIED BY 'secure_password_here';
CREATE DATABASE University_Clinic_Management_System;
GRANT ALL PRIVILEGES ON University_Clinic_Management_System.* TO 'clinic_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run schema
mysql -u clinic_user -p University_Clinic_Management_System < config/schema.sql

# Create admin
node create-admin.js
```

#### 6. Start Backend with PM2
```bash
pm2 start start.js --name clinic-backend
pm2 save
pm2 startup
```

#### 7. Build Frontend
```bash
cd ../frontend
npm install
npm run build
```

#### 8. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/clinic-system
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/clinic-system/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 9. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/clinic-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 10. Setup SSL (Optional but Recommended)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile (Backend)
```dockerfile
# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "start.js"]
```

#### 2. Create Dockerfile (Frontend)
```dockerfile
# frontend/Dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Create docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: University_Clinic_Management_System
      MYSQL_USER: clinic_user
      MYSQL_PASSWORD: clinic_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/config/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      DB_HOST: mysql
      DB_USER: clinic_user
      DB_PASS: clinic_password
      DB_NAME: University_Clinic_Management_System
      PORT: 3000
      NODE_ENV: production
      JWT_SECRET: your_secret_key
    ports:
      - "3000:3000"
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

#### 4. Deploy with Docker
```bash
docker-compose up -d
```

---

## Maintenance

### Regular Tasks

#### Daily
- Monitor system logs
- Check queue performance
- Verify backups completed

#### Weekly
- Review error logs
- Check disk space
- Update system statistics
- Review user feedback

#### Monthly
- Update dependencies
- Review security logs
- Optimize database
- Generate reports

### Monitoring

#### Check Backend Status
```bash
pm2 status
pm2 logs clinic-backend
```

#### Check Database Status
```bash
mysql -u root -p -e "SHOW PROCESSLIST;"
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
```

#### Check Disk Space
```bash
df -h
```

#### Check Memory Usage
```bash
free -h
```

### Updates

#### Update Backend Dependencies
```bash
cd backend
npm update
npm audit fix
```

#### Update Frontend Dependencies
```bash
cd frontend
npm update
npm audit fix
```

#### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

---

## Backup & Recovery

### Database Backup

#### Manual Backup
```bash
# Full backup
mysqldump -u root -p University_Clinic_Management_System > backup_$(date +%Y%m%d).sql

# Compressed backup
mysqldump -u root -p University_Clinic_Management_System | gzip > backup_$(date +%Y%m%d).sql.gz
```

#### Automated Daily Backup
Create backup script: `/usr/local/bin/backup-clinic-db.sh`

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/clinic-system"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="University_Clinic_Management_System"
DB_USER="root"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-clinic-db.sh
sudo crontab -e

# Add line (runs daily at 2 AM):
0 2 * * * /usr/local/bin/backup-clinic-db.sh
```

### Database Recovery

#### Restore from Backup
```bash
# Uncompressed backup
mysql -u root -p University_Clinic_Management_System < backup_20241217.sql

# Compressed backup
gunzip < backup_20241217.sql.gz | mysql -u root -p University_Clinic_Management_System
```

### File Backup

#### Backup Application Files
```bash
tar -czf clinic-system-backup-$(date +%Y%m%d).tar.gz /var/www/clinic-system
```

#### Backup Configuration
```bash
cp backend/.env backend/.env.backup
cp frontend/.env frontend/.env.backup
```

---

## Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
pm2 logs clinic-backend
```

**Common issues:**
1. Port already in use
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. Database connection failed
   - Check MySQL is running: `sudo systemctl status mysql`
   - Verify credentials in `.env`
   - Test connection: `node check-db.js`

3. Missing dependencies
   ```bash
   cd backend
   npm install
   ```

### Frontend Build Fails

**Check Node version:**
```bash
node --version  # Should be 16+
```

**Clear cache and rebuild:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Issues

**Check MySQL status:**
```bash
sudo systemctl status mysql
```

**Restart MySQL:**
```bash
sudo systemctl restart mysql
```

**Check disk space:**
```bash
df -h
```

**Optimize tables:**
```sql
USE University_Clinic_Management_System;
OPTIMIZE TABLE patients, appointments, medical_records;
```

### Performance Issues

**Check server resources:**
```bash
top
htop
```

**Check slow queries:**
```sql
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;
```

**Add indexes if needed:**
```sql
CREATE INDEX idx_patient_name ON patients(first_name, last_name);
CREATE INDEX idx_appointment_date ON appointments(appointment_date);
```

---

## Security Checklist

### Before Going Live

- [ ] Change all default passwords
- [ ] Update JWT_SECRET to random string
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Review user permissions
- [ ] Update all dependencies
- [ ] Run security audit: `npm audit`
- [ ] Test disaster recovery
- [ ] Document admin procedures
- [ ] Train staff on security

### Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow MySQL (only from localhost)
sudo ufw deny 3306/tcp

# Enable firewall
sudo ufw enable
```

---

## Support

### Getting Help
- Check logs: `pm2 logs`
- Review documentation
- Check GitHub issues
- Contact system administrator

### Reporting Issues
Include:
- Error messages
- Log files
- Steps to reproduce
- System information
- Screenshots if applicable

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Maintained By:** Development Team
