# Family Portfolio Backend - Refactored Architecture

## Overview

This project has been refactored to follow enterprise middleware service design patterns with proper separation of concerns, dependency injection, comprehensive error handling, and structured logging.

## Architecture

The refactored architecture follows clean architecture principles with the following layers:

### 1. **API Layer** (`app/api/`)
- **Responsibility**: HTTP request/response handling, routing, and API documentation
- **Components**: FastAPI routers, endpoint handlers, request/response validation
- **Pattern**: Controller pattern with dependency injection

### 2. **Service Layer** (`app/services/`)
- **Responsibility**: Business logic, validation, and orchestration
- **Components**: Service classes with business rules and workflows
- **Pattern**: Service layer pattern with transaction management

### 3. **Repository Layer** (`app/repositories/`)
- **Responsibility**: Data access abstraction and persistence logic
- **Components**: Repository interfaces and implementations
- **Pattern**: Repository pattern with generic CRUD operations

### 4. **Model Layer** (`app/models/`)
- **Responsibility**: Data models and database schema definitions
- **Components**: SQLAlchemy ORM models
- **Pattern**: Active Record pattern

### 5. **Schema Layer** (`app/schemas/`)
- **Responsibility**: Data validation, serialization, and API contracts
- **Components**: Pydantic models for request/response validation
- **Pattern**: Data Transfer Object (DTO) pattern

## Key Improvements

### 🏗️ **Dependency Injection Container**

```python
from app.core.container import container
from app.services.family_member import FamilyMemberService

# Register services
container.register_singleton(FamilyMemberService, FamilyMemberService)

# Resolve dependencies
service = container.resolve(FamilyMemberService)
```

### 🎯 **Exception Handling**

Custom exception hierarchy with proper HTTP status code mapping:

```python
from app.exceptions import ValidationError, NotFoundError, ConflictError

# Business logic exceptions
raise ValidationError("Invalid data", field="email")
raise NotFoundError("User", user_id)
raise ConflictError("Email already exists")
```

### 📊 **Structured Logging**

JSON-based structured logging with request tracing:

```python
{
  "timestamp": "2023-12-01T10:30:00Z",
  "level": "INFO",
  "logger": "family_portfolio.api",
  "message": "User created successfully",
  "request_id": "uuid-123",
  "user_id": "456"
}
```

### 🔧 **Configuration Management**

Environment-aware configuration with validation:

```python
from app.core.config import settings

# Typed and validated settings
database_url = settings.database.url
log_level = settings.logging.level
max_file_size = settings.file_upload.max_file_size
```

### 🛡️ **Middleware Stack**

Comprehensive middleware for cross-cutting concerns:

1. **Request Tracing**: Correlation IDs and distributed tracing
2. **Logging**: Structured request/response logging
3. **Error Handling**: Centralized error handling with proper formatting
4. **CORS**: Cross-origin resource sharing configuration

## Project Structure

```
app/
├── api/                    # API layer
│   └── v1/
│       ├── api.py         # Main API router
│       └── endpoints/     # Route handlers
│           ├── system.py      # Health, metrics
│           ├── family_members.py  # Family member endpoints
│           ├── auth.py        # Authentication
│           └── photos.py      # Photo management
├── core/                   # Core infrastructure
│   ├── config.py          # Configuration management
│   ├── database.py        # Database setup
│   └── container/         # Dependency injection
├── exceptions/             # Custom exceptions
│   ├── __init__.py
│   └── base.py            # Base exception classes
├── middleware/             # Cross-cutting concerns
│   ├── logging.py         # Request logging
│   ├── error_handler.py   # Error handling
│   └── request_tracing.py # Request tracing
├── models/                 # Database models
│   ├── family_member.py
│   └── user.py
├── repositories/           # Data access layer
│   ├── base.py            # Base repository
│   └── family_member.py   # Family member repository
├── schemas/                # Pydantic schemas
│   └── family_member.py   # Family member DTOs
├── services/               # Business logic layer
│   ├── base.py            # Base service
│   └── family_member.py   # Family member service
├── utils/                  # Utilities
└── main.py                # Application entry point
```

## Design Patterns Implemented

### 1. **Repository Pattern**
Abstracts data access logic with a consistent interface:

```python
class FamilyMemberRepository(BaseRepository[FamilyMember]):
    async def search(self, term: str) -> List[FamilyMember]:
        # Implementation specific to family members
        pass
```

### 2. **Service Layer Pattern**
Encapsulates business logic and coordinates between layers:

```python
class FamilyMemberService(BaseService):
    async def create(self, data: FamilyMemberCreate) -> FamilyMemberResponse:
        await self._validate_create(data)  # Business rules
        entity = await self.repository.create(data)
        await self._post_create(entity)    # Side effects
        return self.response_schema.from_orm(entity)
```

### 3. **Dependency Injection**
Promotes loose coupling and testability:

```python
def get_family_member_service(db: Session = Depends(get_db)) -> FamilyMemberService:
    repository = FamilyMemberRepository(db)
    return FamilyMemberService(repository)
```

### 4. **Middleware Pattern**
Cross-cutting concerns applied consistently:

```python
app.add_middleware(RequestTracingMiddleware)
app.add_middleware(LoggingMiddleware, logger=logger)
app.add_middleware(ErrorHandlerMiddleware, logger=logger)
```

## Configuration

### Environment Variables

```bash
# Application
ENVIRONMENT=development|staging|production
DEBUG=true|false
APP_NAME="Family Portfolio API"

# Database
DATABASE__URL=postgresql://user:pass@host:port/db
DATABASE__POOL_SIZE=10
DATABASE__MAX_OVERFLOW=20

# Security
SECURITY__SECRET_KEY=your-secret-key-32-chars-min
SECURITY__ACCESS_TOKEN_EXPIRE_MINUTES=43200

# Logging
LOGGING__LEVEL=INFO|DEBUG|WARNING|ERROR
LOGGING__FORMAT=json|text
LOGGING__FILE_ENABLED=true|false

# File Upload
FILE_UPLOAD__MAX_FILE_SIZE=10485760  # 10MB
FILE_UPLOAD__UPLOAD_PATH=./uploads
```

### Configuration Validation

All configuration is validated using Pydantic models with proper error messages and type checking.

## API Endpoints

### System Endpoints

- `GET /` - Root endpoint with API information
- `GET /health` - Health check with database connectivity
- `GET /metrics` - Basic metrics (if enabled)

### Family Member Endpoints

- `GET /api/v1/family-members/` - Paginated list with search
- `GET /api/v1/family-members/tree` - Family tree structure
- `GET /api/v1/family-members/living` - Living members only
- `GET /api/v1/family-members/deceased` - Deceased members only
- `GET /api/v1/family-members/{id}` - Get specific member
- `GET /api/v1/family-members/{id}/ancestors` - Get ancestors
- `GET /api/v1/family-members/{id}/descendants` - Get descendants
- `GET /api/v1/family-members/{id}/siblings` - Get siblings
- `POST /api/v1/family-members/` - Create new member
- `PUT /api/v1/family-members/{id}` - Update member
- `DELETE /api/v1/family-members/{id}` - Delete member

## Business Rules

### Family Member Management

1. **Parent Validation**: Parents must exist before assignment
2. **Circular Reference Prevention**: Members cannot be ancestors of themselves
3. **Deletion Protection**: Members with children cannot be deleted
4. **Date Validation**: Death date must be after birth date
5. **Search Minimum**: Search terms must be at least 2 characters

## Error Handling

### Standardized Error Responses

```json
{
  "error": true,
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "details": {
    "field": "parent_id",
    "reason": "Parent member does not exist"
  },
  "request_id": "uuid-123",
  "timestamp": "2023-12-01T10:30:00Z"
}
```

### Exception Hierarchy

- `FamilyPortfolioException` - Base exception
  - `ValidationError` - Input validation failures
  - `NotFoundError` - Resource not found
  - `ConflictError` - Business rule violations
  - `UnauthorizedError` - Authentication failures
  - `ForbiddenError` - Authorization failures
  - `InternalServerError` - System errors

## Logging

### Request Logging

Every request is logged with:
- Request ID for tracing
- HTTP method and URL
- Query parameters and headers
- Request/response timing
- Error details (if any)

### Structured Format

```json
{
  "event": "request_completed",
  "request_id": "uuid-123",
  "method": "POST",
  "url": "/api/v1/family-members/",
  "status_code": 201,
  "process_time": 0.1234,
  "user_id": "user-456"
}
```

## Testing

### Unit Tests

The refactored architecture supports comprehensive unit testing:

```python
class TestFamilyMemberService:
    def setup_method(self):
        self.mock_repository = Mock(spec=FamilyMemberRepository)
        self.service = FamilyMemberService(self.mock_repository)
    
    @pytest.mark.asyncio
    async def test_create_family_member_success(self):
        # Test implementation
        pass
```

### Test Coverage Areas

1. **Service Layer**: Business logic and validation
2. **Repository Layer**: Data access and queries
3. **API Layer**: Request/response handling
4. **Middleware**: Cross-cutting concerns
5. **Configuration**: Settings validation

## Deployment

### Environment Configuration

1. **Development**: Debug enabled, detailed logging
2. **Staging**: Production-like with monitoring
3. **Production**: Optimized, secure, monitored

### Docker Support

The application includes Docker configuration with multi-stage builds and security best practices.

## Monitoring

### Health Checks

- Database connectivity
- Service availability
- Resource utilization

### Metrics

- Request counts and timing
- Error rates
- Business metrics

### Tracing

- Request correlation IDs
- Distributed tracing support
- Performance monitoring

## Security

### Best Practices

1. **Input Validation**: Pydantic schema validation
2. **Error Handling**: No sensitive data in error messages
3. **Configuration**: Environment-based secrets
4. **CORS**: Proper origin validation
5. **Headers**: Security headers added

## Performance

### Optimizations

1. **Database**: Connection pooling, query optimization
2. **Caching**: Redis support for session and data caching
3. **Async**: Full async/await implementation
4. **Middleware**: Efficient request processing pipeline

## Future Enhancements

1. **Authentication**: JWT-based auth with role management
2. **File Upload**: Secure file handling with virus scanning
3. **Search**: Full-text search with Elasticsearch
4. **Notifications**: Event-driven notifications
5. **API Versioning**: Comprehensive versioning strategy
6. **Rate Limiting**: Request rate limiting and throttling
7. **Caching**: Redis-based caching layer
8. **Monitoring**: Prometheus metrics and Grafana dashboards

## Contributing

When contributing to this project, please:

1. Follow the established architecture patterns
2. Write comprehensive unit tests
3. Use proper error handling
4. Add structured logging
5. Document new features
6. Follow code style guidelines