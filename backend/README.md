# Micro-Entrepreneur Growth App - Backend

Backend API for the Micro-Entrepreneur Growth App built with FastAPI.

## Features

- User authentication with JWT
- Customer management
- Referral system
- Social media integration
- AI-powered assistant (Google Gemini)
- Dashboard and analytics
- Background task processing

## Tech Stack

- Python 3.11
- FastAPI
- SQLAlchemy (ORM)
- SQLite (development) / PostgreSQL (production)
- JWT for authentication
- Celery for background tasks
- Redis for caching
- Docker for containerization

## Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
6. Update the `.env` file with your configuration

## Database Setup

Run the database initialization script:
```bash
python app/init_db.py
```

## Running the Application

### Development

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Production

Using Docker:
```bash
docker-compose up -d
```

## API Documentation

Once the server is running, you can access:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing

Run tests with pytest:
```bash
pytest
```

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: Secret key for JWT
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `CELERY_BROKER_URL`: Redis URL for Celery
- `CELERY_RESULT_BACKEND`: Redis URL for Celery results