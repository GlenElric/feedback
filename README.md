# Feedback Collection Platform

A comprehensive web-based platform for creating, distributing, and analyzing feedback forms for events and courses.

## Features

- **Form Builder**: Create customizable feedback forms with multiple question types
- **Anonymous & Authenticated Submissions**: Support both logged-in and anonymous respondents
- **Analytics Dashboard**: Visualize responses with interactive charts
- **Secure**: JWT authentication, password hashing, input validation
- **Responsive**: Mobile-first design with modern UI

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MySQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Security**: Passlib (bcrypt)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: TanStack Query

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Chiac01
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
copy .env.example .env
# Edit .env with your database credentials and secret keys
```

### 3. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE feedback_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update the `DATABASE_URL` in your `.env` file:

```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/feedback_db
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# The frontend will proxy API requests to http://localhost:8000
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
# Make sure virtual environment is activated
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
Chiac01/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app
│   │   ├── database.py          # Database config
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── routers/             # API endpoints
│   │   ├── schemas/             # Pydantic schemas
│   │   └── utils/               # Helper functions
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── contexts/            # React contexts
│   │   ├── utils/               # Utilities
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── vite.config.js
├── prd.md                        # Product Requirements Document
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Forms
- `GET /api/forms` - List user's forms
- `POST /api/forms` - Create new form
- `GET /api/forms/{form_id}` - Get form details
- `PUT /api/forms/{form_id}` - Update form
- `DELETE /api/forms/{form_id}` - Delete form

### Responses
- `POST /api/forms/{form_id}/responses` - Submit response
- `GET /api/forms/{form_id}/responses` - Get all responses

### Analytics
- `GET /api/forms/{form_id}/analytics/summary` - Get summary stats
- `GET /api/forms/{form_id}/analytics/charts` - Get chart data

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ --cov=app

# Frontend tests
cd frontend
npm run test
```

### Code Quality

```bash
# Frontend linting
cd frontend
npm run lint
```

## Deployment

TODO: Add deployment instructions for production

## License

TODO: Add license information

## Contributing

TODO: Add contributing guidelines
