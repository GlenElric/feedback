# Quick Start Guide

This guide will help you get the Feedback Collection Platform up and running quickly.

## Prerequisites Check

Before starting, ensure you have:

- ✅ Python 3.10 or higher (`python --version`)
- ✅ Node.js 18 or higher (`node --version`)
- ✅ MySQL 8.0 or higher
- ✅ Git (optional)

## Quick Setup Steps

### 1. Database Setup (5 minutes)

Open MySQL and create a database:

```sql
CREATE DATABASE feedback_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use the command line:

```bash
# Windows (using mysql)
mysql -u root -p
CREATE DATABASE feedback_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Backend Setup (5 minutes)

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows
#source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Edit .env file with your database credentials
# DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/feedback_db
# SECRET_KEY=generate-a-secure-random-string-here
```

**Important:** Update your `.env` file with:
- Your MySQL credentials (username, password)
- A secure SECRET_KEY (use a random string generator)

### 3. Frontend Setup (3 minutes)

```bash
# Open a NEW terminal
cd frontend

# Install dependencies
npm install
```

### 4. Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
# Make sure venv is activated
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 5. Verify Installation

1. **Backend API:** Open http://localhost:8000/docs
   - You should see the Swagger API documentation
   - Try the `/health` endpoint

2. **Frontend:** Open http://localhost:5173
   - You should see the platform homepage

## Troubleshooting

### Database Connection Error

**Error:** `connection to server failed`

**Solution:**
1. Make sure MySQL is running
2. Check your DATABASE_URL in `.env`
3. Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Port Already in Use

**Error:** `Address already in use`

**Solution:**
- Backend: Use different port `uvicorn app.main:app --reload --port 8001`
- Frontend: Edit `vite.config.js` to change port

### Module Not Found (Python)

**Error:** `ModuleNotFoundError`

**Solution:**
1. Make sure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`

### Module Not Found (Node)

**Error:** `Cannot find module`

**Solution:**
1. Delete `node_modules` folder
2. Run `npm install` again

## Next Steps

Now that your platform is running:

1. **Test Authentication:**
   - Register a new user via API at `/api/auth/register`
   - Login and receive JWT token
   - Access protected endpoints

2. **Database Verification:**
   - Check that tables were created:
   ```sql
   USE feedback_db;
   SHOW TABLES;
   ```

3. **Development:**
   - Backend changes auto-reload (FastAPI --reload)
   - Frontend changes auto-refresh (Vite HMR)
   - Monitor terminal for errors

## Development Workflow

1. Make code changes
2. Check terminal for errors
3. Test in browser/API docs
4. Commit changes with Git (optional)

## Quick Reference

### Start Backend
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### View API Documentation
http://localhost:8000/docs

### Access Application
http://localhost:5173

---

**Need Help?** Check the main README.md for detailed documentation.
