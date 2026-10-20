# 🚀 IndaureX — Multi-Tenant WhatsApp SaaS Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com)

A modern, production-grade, multi-tenant SaaS platform allowing organizations to connect their Twilio WhatsApp Business accounts, automate customer communications, and manage conversations from a centralized dashboard.

---

## ✨ Key Features

- **🏢 Multi-Tenant Architecture**: Strict organizational isolation. Each tenant has isolated users, credentials, and settings.
- **🔐 Secure Authentication**:
  - Multi-tenant registration (creates tenant organization + owner account in a single transaction).
  - Bcrypt password hashing & robust validation rules.
  - Signed JWT access tokens for protected API routes.
- **📱 Twilio WhatsApp Integration**:
  - Connect your Twilio Account SID, Auth Token, and WhatsApp sender number.
  - **Fernet Encryption at Rest**: Twilio auth tokens are encrypted in the database using symmetric keys.
- **⚡ Webhook Ingestion**:
  - Handles incoming WhatsApp message events from Twilio.
  - Multi-tenant routing based on receiving WhatsApp number.
- **📊 Modern Dashboard UI**:
  - Sleek dark-mode glassmorphism interface.
  - Live tenant stats, connection status badges, and webhook URL generator.
  - Interactive credential management modal with masked credentials.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    A[Client Browser] -->|Next.js 16 / React 19| B[Frontend Dashboard]
    B -->|REST API / Bearer JWT| C[FastAPI Backend]
    C -->|SQLAlchemy 2| D[(PostgreSQL)]
    E[Twilio WhatsApp API] -->|Webhooks| C
    C -->|Encrypted API Requests| E
```

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4 | Interactive UI with Turbopack, responsive layout, glassmorphism |
| **Backend** | FastAPI, Pydantic v2, Uvicorn | High-performance asynchronous REST API |
| **Database** | PostgreSQL, SQLAlchemy 2 | Relational schema with UUID primary keys |
| **Security** | Python-Jose (JWT), Passlib (Bcrypt), Cryptography (Fernet) | Token authorization & sensitive credential encryption |
| **Containerization** | Docker, Docker Compose | Reproducible environment for database and API |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py          # Register & Login endpoints
│   │   │   │   ├── dashboard.py     # Tenant dashboard stats
│   │   │   │   ├── twilio.py        # Twilio credential configuration
│   │   │   │   └── webhook.py       # Twilio WhatsApp webhook receiver
│   │   │   └── deps.py              # JWT authentication dependency
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic environment settings
│   │   │   └── security.py          # JWT generation & verification
│   │   ├── db/
│   │   │   └── session.py           # SQLAlchemy session & Base engine
│   │   ├── models/
│   │   │   └── models.py            # Tenant, User, TwilioConfig ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic request/response schemas
│   │   └── main.py                  # FastAPI application entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/           # Authenticated user dashboard
│   │   │   ├── globals.css          # Tailwind CSS styling & animations
│   │   │   ├── layout.js            # Root layout with AuthProvider
│   │   │   └── page.js              # Landing / Sign-in / Registration page
│   │   ├── context/
│   │   │   └── AuthContext.js       # Client authentication state & session
│   │   └── lib/
│   │       └── api.js               # Typed client fetcher with JWT bearer injection
│   ├── .env.example
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml
├── start_db.ps1                     # Windows helper script for local PostgreSQL
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.17+ or v20+)
- **Python** (v3.10+)
- **PostgreSQL** (v15+) or **Docker Desktop**

---

### Method 1: Local Development

#### 1. Database Setup
Ensure PostgreSQL is running and create the database:
```sql
CREATE DATABASE indaurex_db;
```
*(On Windows, you can also run `./start_db.ps1` if using the included local cluster).*

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database URL & secret keys

# Start backend server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Method 2: Docker Compose

To start the database and backend with a single command:

```bash
docker compose up --build
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Default / Example | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `IndaureX SaaS Platform` | Application display name |
| `DEBUG` | `true` | Enable debug logs |
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/indaurex_db` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | *(64-character random string)* | Secret for signing JWTs |
| `JWT_ALGORITHM` | `HS256` | Token algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT expiration (in minutes) |
| `FERNET_SECRET_KEY` | *(Fernet symmetric key)* | Encryption key for Twilio tokens |
| `WEBHOOK_BASE_URL` | `http://localhost:8000/v1/twilio/webhook` | Public URL for Twilio webhook callback |

> **Generate Fernet Secret Key:**
> ```bash
> python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
> ```

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/v1` | URL pointing to the FastAPI backend |

---

## 📡 API Endpoints

### Authentication
- `POST /v1/auth/register` — Create a new tenant and owner user. Returns access token.
- `POST /v1/auth/login` — Authenticate existing user. Returns access token.

### Dashboard
- `GET /v1/dashboard` — Fetch tenant overview, connection status, and webhook URL *(Requires Bearer Token)*.

### Twilio Configuration
- `POST /v1/twilio/config` — Save/Update Twilio Account SID, Auth Token & WhatsApp number *(Requires Bearer Token)*.
- `GET /v1/twilio/config` — View current configured WhatsApp sender & masked SID *(Requires Bearer Token)*.

### Webhook
- `POST /v1/twilio/webhook` — Public webhook receiver for Twilio incoming messages.

### Health
- `GET /health` — Service health check.

---

## 🔒 Security Best Practices

- **Password Requirements**: Minimum 8 characters, at least 1 uppercase letter, and at least 1 digit.
- **Tenant Isolation**: Every SQL query is automatically scoped by the user's `tenant_id`.
- **Sensitive Credentials**: Twilio Auth Tokens are never stored in plaintext and never returned to the frontend.
- **CORS Configured**: Restricted to authorized frontend origins.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
