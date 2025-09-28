# Family Portfolio Backend API

A FastAPI-based backend service for managing family heritage data and genealogy information.

## Features
- RESTful API for family member management
- File upload and management system
- PostgreSQL database integration
- JWT authentication support
- Automatic API documentation with Swagger/OpenAPI

## Quick Start

### Using Docker (Recommended)

1. **Create the external network** (run once):
   ```bash
   docker network create family_network
   ```

2. **Start the backend**:
   ```bash
   docker-compose up -d
   ```

3. **Access the API**:
   - API Base: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

### Development Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the development server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key for authentication
- `DEBUG`: Enable debug mode (true/false)
- `CORS_ORIGINS`: Allowed CORS origins (JSON array)

### Database Connection
Make sure PostgreSQL is running and accessible. The backend will automatically create tables on startup.

## API Endpoints

### Family Members
- `GET /api/v1/family-members/` - List all family members
- `POST /api/v1/family-members/` - Create new family member
- `GET /api/v1/family-members/{id}` - Get family member by ID
- `PUT /api/v1/family-members/{id}` - Update family member
- `DELETE /api/v1/family-members/{id}` - Delete family member

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user

### Files
- `POST /api/v1/upload/` - Upload files
- `GET /uploads/{filename}` - Serve uploaded files

## Docker Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down

# Rebuild
docker-compose build --no-cache
```

## Project Structure
```
app/
├── api/v1/         # API version 1 routes
├── core/           # Core configuration and database
├── models/         # SQLAlchemy database models
├── schemas/        # Pydantic schemas for API
├── services/       # Business logic services
├── utils/          # Utility functions
└── main.py         # FastAPI application entry point
```

## Dependencies
- FastAPI - Modern web framework
- SQLAlchemy - Database ORM
- Alembic - Database migrations
- Pydantic - Data validation
- PostgreSQL - Primary database

## Database Migrations

```bash
# Generate new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# View migration history
alembic history
```

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```