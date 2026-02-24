<p align="center">
  <h1 align="center">feedback<span>.</span></h1>
  <p align="center">
    A modern, minimalist platform for creating, distributing, and deeply analyzing feedback forms.
    <br />
    Built with FastAPI &amp; React — designed with a refined black &amp; white aesthetic.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.10+-000?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/node-18+-000?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/fastapi-0.109-000?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/react-18.2-000?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/mysql-8.0-000?style=flat-square&logo=mysql&logoColor=white" />
</p>

---

## Overview

**feedback.** is a full-stack feedback collection platform that goes beyond simple form creation. It combines an intuitive form builder with advanced analytics — including **sentiment analysis**, **keyword extraction**, **performance scoring**, and **trend analysis** — to help you truly understand the feedback you receive.

### Why feedback.?

| Feature | Description |
|---|---|
| **Form Builder** | Create forms with 6 question types: short text, long text, multiple choice, rating, yes/no, dropdown |
| **Smart Sharing** | One-click shareable links for public form submission |
| **Response Analytics** | Interactive charts for ratings, distributions, and text responses |
| **Sentiment Analysis** | Built-in NLP engine analyzes text responses for positive, neutral, and negative sentiment |
| **Keyword Extraction** | TF-IDF keyword and phrase extraction from text responses |
| **Performance Scoring** | Weighted 0–100 form performance score across 5 dimensions |
| **Trend Analysis** | Track response volume, rating trends, and sentiment shifts over time |
| **Minimalist Design** | Refined B&W aesthetic with subtle micro-animations |

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | High-performance async API framework |
| [SQLAlchemy](https://www.sqlalchemy.org/) | ORM and database toolkit |
| [MySQL](https://www.mysql.com/) | Relational database |
| [Pydantic](https://pydantic.dev/) | Data validation and serialization |
| [python-jose](https://github.com/mpdavis/python-jose) | JWT authentication |
| [Passlib + bcrypt](https://passlib.readthedocs.io/) | Password hashing |
| Custom NLP Module | Sentiment analysis & keyword extraction (zero external NLP deps) |

### Frontend

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI library |
| [Vite](https://vitejs.dev/) | Build tool and dev server |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [Recharts](https://recharts.org/) | Charting library (bar, line, area, pie, radar) |
| [Axios](https://axios-http.com/) | HTTP client |
| [TanStack Query](https://tanstack.com/query/) | Server state management |

---

## Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **MySQL** 8.0 or higher

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Chiac01
```

### 2. Database setup

Create the MySQL database:

```sql
CREATE DATABASE feedback_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> **Quick setup:** You can also run `setup_db.bat` (Windows) which automates database creation.

### 3. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux
```

Edit `.env` with your credentials:

```env
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/feedback_db
SECRET_KEY=your-secret-key-here
```

### 4. Frontend setup

```bash
cd frontend
npm install
```

### 5. Start the application

Open **two terminals**:

**Terminal 1 — Backend** (port 8000):
```bash
cd backend
venv\Scripts\activate        # or source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend** (port 5173):
```bash
cd frontend
npm run dev
```

> **Quick start:** You can also run `start_backend.bat` to launch the backend on Windows.

### 6. Open the app

| URL | Description |
|---|---|
| `http://localhost:5173` | Frontend application |
| `http://localhost:8000/docs` | Interactive API documentation (Swagger) |
| `http://localhost:8000/health` | Health check endpoint |

---

## Project Structure

```
Chiac01/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application & router registration
│   │   ├── database.py              # SQLAlchemy engine & session config
│   │   ├── models.py                # Database models (User, Form, Question, Response, Answer)
│   │   ├── routers/
│   │   │   ├── auth.py              # Register, login, token refresh
│   │   │   ├── forms.py             # CRUD operations & basic analytics
│   │   │   ├── analytics.py         # Advanced insights (sentiment, keywords, trends)
│   │   │   └── public.py            # Public form access & response submission
│   │   ├── schemas/
│   │   │   ├── user_schemas.py      # User request/response models
│   │   │   ├── form_schemas.py      # Form & question schemas
│   │   │   └── response_schemas.py  # Response & answer schemas
│   │   └── utils/
│   │       ├── security.py          # JWT creation, password hashing, auth deps
│   │       └── nlp.py               # Sentiment analysis & keyword extraction engine
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Authentication — sign in
│   │   │   ├── Register.jsx         # Authentication — sign up
│   │   │   ├── Dashboard.jsx        # Form management & overview stats
│   │   │   ├── CreateForm.jsx       # Form builder with question editor
│   │   │   ├── FillForm.jsx         # Public form submission interface
│   │   │   ├── FormResponses.jsx    # Basic response analytics & charts
│   │   │   └── FormInsights.jsx     # Advanced insights (sentiment, keywords, performance, trends)
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Authentication state provider
│   │   ├── utils/
│   │   │   └── api.js               # Axios instance with auth interceptor
│   │   ├── App.jsx                  # Router & route definitions
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global design system (B&W theme)
│   ├── package.json
│   └── vite.config.js
│
├── prd.md                           # Product Requirements Document
├── DATABASE_SETUP.md                # Detailed database setup guide
├── QUICKSTART.md                    # Quick start instructions
└── README.md
```

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | — |
| `POST` | `/api/auth/login` | Login and receive JWT | — |
| `POST` | `/api/auth/refresh` | Refresh access token | 🔒 |

### Forms (Protected)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/forms/` | List all forms by current user | 🔒 |
| `POST` | `/api/forms/` | Create a new form with questions | 🔒 |
| `GET` | `/api/forms/{id}` | Get form details | 🔒 |
| `PUT` | `/api/forms/{id}` | Update form settings | 🔒 |
| `DELETE` | `/api/forms/{id}` | Delete a form | 🔒 |

### Responses & Analytics (Protected)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/forms/{id}/responses` | Get all raw responses | 🔒 |
| `GET` | `/api/forms/{id}/analytics` | Basic analytics (distributions, averages) | 🔒 |
| `GET` | `/api/forms/{id}/insights` | Advanced insights (sentiment, keywords, performance, trends) | 🔒 |

### Public

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/public/forms/{id}` | Get form for filling | — |
| `POST` | `/api/public/forms/{id}/responses` | Submit a response | — |

> Full interactive documentation available at `/docs` when the backend is running.

---

## Analytics Deep Dive

The platform provides two levels of analytics:

### Basic Analytics (`/forms/{id}/responses`)

- **Rating distributions** — Bar charts showing how respondents rated each question
- **Choice distributions** — Donut charts for multiple choice, yes/no, and dropdown questions
- **Text response listing** — Browse individual text answers
- **Summary statistics** — Total responses, question count, average completion time

### Advanced Insights (`/forms/{id}/insights`)

#### 🎯 Performance Score
A weighted composite score (0–100) with letter grade, computed from five dimensions:

| Dimension | Weight | What it measures |
|---|---|---|
| Response Volume | 15% | How many responses have been collected |
| Completion Quality | 25% | Average % of questions answered per response |
| Average Rating | 25% | Normalized average across rating questions |
| Sentiment | 20% | Overall sentiment of text responses |
| Engagement | 15% | Completion time (too fast = low effort, too slow = struggle) |

Visualized as a **radar chart** with individual dimension breakdowns.

#### 💭 Sentiment Analysis
Powered by a built-in NLP engine (no external API keys needed):
- 200+ word sentiment lexicon with scores from −5 to +5
- Negation detection ("not good" → negative)
- Intensifier amplification ("very good" → stronger positive)
- Per-response scoring with overall aggregate
- Per-question sentiment breakdown
- Sentiment distribution (positive / neutral / negative)

#### 🔑 Keyword Extraction
- TF-IDF weighted keyword scoring
- Stop word filtering for meaningful terms
- Bigram phrase detection for common two-word patterns
- Sentiment-tagged keywords (positive / neutral / negative)

#### 📈 Trend Analysis
- Daily response volume with cumulative curve
- Rating trend over time
- Sentiment trend over time
- Gap-filled timelines for continuous visualization

---

## Design System

The UI follows a strict **minimalist black & white** design philosophy:

- **Palette**: Monochrome shades from `#000000` to `#ffffff` (12 grays)
- **Typography**: Inter (body) + JetBrains Mono (numbers, code)
- **Borders**: Hairline borders with transparency
- **Shadows**: Very subtle depth cues
- **Animations**: 220ms ease-out micro-animations on interactions
- **Layout**: Generous whitespace with max-width containers

---

## Question Types

| Type | Description | Analytics |
|---|---|---|
| **Short Text** | Single-line text input | Sentiment, Keywords |
| **Long Text** | Multi-line textarea | Sentiment, Keywords |
| **Multiple Choice** | Radio button options | Distribution chart |
| **Rating (1–5)** | Numeric scale | Bar chart, Average, Trend |
| **Yes / No** | Binary choice | Distribution chart |
| **Dropdown** | Select from options | Distribution chart |

---

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ --cov=app

# Frontend build check
cd frontend
npm run build
```

### Code Quality

```bash
# Frontend linting
cd frontend
npm run lint
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | — |
| `SECRET_KEY` | JWT signing secret | — |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173,http://localhost:3000` |

---

## License

This project is licensed under the MIT License.

---

<p align="center">
  <sub>Built with precision. Designed with restraint.</sub>
</p>
