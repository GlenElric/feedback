# MySQL Database Setup Instructions

## Overview
The Feedback Collection Platform now uses **MySQL** as the database for the MVP.

## Prerequisites
- MySQL 8.0 or higher installed
- MySQL server running

## Quick Setup

### Option 1: Using MySQL Workbench (Easiest)

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Click "Create a new schema" (database icon)
4. Name it: `feedback_db`
5. Character set: `utf8mb4`
6. Collation: `utf8mb4_unicode_ci`
7. Click "Apply"

### Option 2: Using MySQL Command Line

```bash
# Open MySQL shell
mysql -u root -p

# Enter your password, then run:
CREATE DATABASE feedback_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify
SHOW DATABASES;

# Exit
EXIT;
```

### Option 3: Using PowerShell/CMD

```bash
mysql -u root -p -e "CREATE DATABASE feedback_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Configuration

### Update .env File

Edit `backend/.env` with your MySQL credentials:

```properties
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/feedback_db
```

**Common Settings:**
- Username: `root` (default)
- Password: Your MySQL root password
- Host: `localhost`
- Port: `3306` (default)

### Install MySQL Driver

```bash
cd backend
.\venv\Scripts\activate
pip install pymysql cryptography
```

## Verify Installation

### Test Connection

```bash
cd backend
.\venv\Scripts\python -c "from app.database import engine; print('Testing connection...'); engine.connect(); print('✅ MySQL connection successful!')"
```

### Start the Application

```bash
# Backend
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

The database tables will be created automatically on first run.

## Troubleshooting

### Error: "Can't connect to MySQL server"

**Solutions:**
1. Verify MySQL service is running:
   - Windows: Services app → MySQL → Start
   - Or run: `net start MySQL80` (adjust for your version)

2. Check if MySQL is listening on port 3306:
   ```bash
   netstat -an | findstr 3306
   ```

### Error: "Access denied for user 'root'"

**Solutions:**
1. Check your password in `.env` file
2. Reset root password if needed:
   ```bash
   mysql -u root -p
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
   FLUSH PRIVILEGES;
   ```

### Error: "Unknown database 'feedback_db'"

**Solution:**
Database doesn't exist yet. Create it using one of the methods above.

### Error: "No module named 'pymysql'"

**Solution:**
```bash
cd backend
.\venv\Scripts\activate
pip install pymysql cryptography
```

## MySQL Installation (If Not Installed)

### Download MySQL

1. Visit: https://dev.mysql.com/downloads/installer/
2. Download MySQL Installer for Windows
3. Run installer and choose "Developer Default"
4. Set root password (remember this!)
5. Complete installation

### Verify Installation

```bash
mysql --version
```

## Database Management

### View Tables

```bash
mysql -u root -p feedback_db
SHOW TABLES;
```

### Backup Database

```bash
mysqldump -u root -p feedback_db > backup.sql
```

### Restore Database

```bash
mysql -u root -p feedback_db < backup.sql
```

## Application URLs

Once MySQL is configured and servers are running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Migration from SQLite

If you were using SQLite before:

1. Your old data is in `backend/feedback.db`
2. MySQL will create fresh tables automatically
3. To migrate data, you'll need to export from SQLite and import to MySQL (manual process)

## Production Recommendations

For production deployment:
- Create a dedicated MySQL user (not root)
- Use strong passwords
- Enable SSL connections
- Set up proper backup schedules
- Consider using MySQL 8.0+ for better performance

### Create Production User

```sql
CREATE USER 'feedback_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON feedback_db.* TO 'feedback_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `.env`:
```properties
DATABASE_URL=mysql+pymysql://feedback_user:strong_password_here@localhost:3306/feedback_db
```

## Current Status

✅ Backend configured for MySQL
✅ MySQL driver (pymysql) in requirements.txt
✅ Connection string format updated
⚠️  MySQL database needs to be created
⚠️  Dependencies need to be installed

Run the setup commands above to complete the MySQL configuration!
