# Family Portfolio - Microservices Architecture

A decoupled family heritage management platform built with modern microservices architecture.

## 🏗️ Architecture Overview

This project is split into three independent services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄───┤   (FastAPI)     │◄───┤  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Services

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| **Frontend** | React.js + Tailwind CSS | 3000 | User interface and experience |
| **Backend** | FastAPI + SQLAlchemy | 8000 | REST API and business logic |
| **Database** | PostgreSQL 15 | 5432 | Data persistence and storage |

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone the Projects
```bash
# If you have the full repository
git clone <repository-url>
cd family-portfolio-projects

# Or if starting fresh, you already have the decoupled structure
```

### 2. Start All Services
```bash
./start-all.sh
```

This script will:
1. Create the Docker network
2. Start the database service
3. Start the backend service  
4. Start the frontend service

### 3. Access the Application
- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

## 📋 Management Commands

### Start/Stop Services
```bash
# Start all services
./start-all.sh

# Stop all services  
./stop-all.sh

# Check status of all services
./status.sh

# View logs from all services
./logs.sh

# Follow logs in real-time
./logs.sh follow
```

### Individual Service Management
```bash
# Start individual services
cd family-portfolio-database && docker-compose up -d
cd family-portfolio-backend && docker-compose up -d  
cd family-portfolio-frontend && docker-compose up -d

# Stop individual services
cd family-portfolio-database && docker-compose down
cd family-portfolio-backend && docker-compose down
cd family-portfolio-frontend && docker-compose down
```

## 🔧 Development Setup

### Environment Configuration

Each service has its own `.env` file for configuration:

#### Database (.env)
```
DB_NAME=family_portfolio
DB_USER=portfolio_admin  
DB_PASSWORD=secure_password_123
DB_PORT=5432
```

#### Backend (.env)
```
DATABASE_URL=postgresql://portfolio_admin:secure_password_123@family_portfolio_database:5432/family_portfolio
SECRET_KEY=your_super_secret_jwt_key_change_in_production
DEBUG=true
BACKEND_PORT=8000
```

#### Frontend (.env) 
```
API_BASE_URL=http://localhost:8000
FRONTEND_PORT=3000
NODE_ENV=development
```

### Local Development

Each service can be run locally for development:

#### Frontend Development
```bash
cd family-portfolio-frontend
npm install
npm start
```

#### Backend Development  
```bash
cd family-portfolio-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Database Development
```bash
cd family-portfolio-database
docker-compose up -d
```

## 🌐 Service Communication

Services communicate through:
- **External Docker Network**: `family_network`
- **Container Names**: Used as hostnames
- **Environment Variables**: For configuration

### Network Configuration
```bash
# Create network (done automatically by start-all.sh)
docker network create family_network

# Inspect network
docker network inspect family_network
```

## 📁 Project Structure

```
family-portfolio-projects/
├── family-portfolio-frontend/     # React.js frontend service
│   ├── src/                      # React source code
│   ├── public/                   # Static assets
│   ├── Dockerfile                # Frontend container
│   ├── docker-compose.yml        # Frontend service definition
│   └── README.md                 # Frontend documentation
│
├── family-portfolio-backend/      # FastAPI backend service  
│   ├── app/                      # Python application code
│   ├── alembic/                  # Database migrations
│   ├── Dockerfile                # Backend container
│   ├── docker-compose.yml        # Backend service definition
│   └── README.md                 # Backend documentation
│
├── family-portfolio-database/     # PostgreSQL database service
│   ├── init/                     # Database initialization scripts
│   ├── backups/                  # Database backup location
│   ├── docker-compose.yml        # Database service definition
│   └── README.md                 # Database documentation
│
├── start-all.sh                  # Start all services
├── stop-all.sh                   # Stop all services
├── status.sh                     # Check service status
├── logs.sh                       # View service logs
└── README.md                     # This file
```

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# Check all services
./status.sh

# Manual health checks
curl http://localhost:3000        # Frontend
curl http://localhost:8000/health # Backend  
psql -h localhost -p 5432 -U portfolio_admin -d family_portfolio # Database
```

### Logs
```bash
# All service logs
./logs.sh

# Individual service logs  
docker-compose -f family-portfolio-frontend/docker-compose.yml logs -f
docker-compose -f family-portfolio-backend/docker-compose.yml logs -f
docker-compose -f family-portfolio-database/docker-compose.yml logs -f
```

### Container Management
```bash
# List all containers
docker ps

# Connect to containers
docker exec -it family_portfolio_frontend sh
docker exec -it family_portfolio_backend bash  
docker exec -it family_portfolio_database psql -U portfolio_admin -d family_portfolio
```

## 🔒 Security Considerations

### Production Deployment
1. **Change Default Passwords**: Update all default passwords in `.env` files
2. **Environment Variables**: Use secure environment variable management
3. **Network Security**: Configure proper firewall rules
4. **SSL/TLS**: Enable HTTPS for frontend and backend
5. **Database Security**: Enable SSL for database connections

### Secrets Management
```bash
# Generate secure passwords
openssl rand -base64 32

# Use Docker secrets (Docker Swarm)
echo "secure_password" | docker secret create db_password -
```

## 🚢 Deployment Options

### Docker Swarm
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  # Service definitions with deploy configurations
  frontend:
    deploy:
      replicas: 2
      placement:
        constraints: [node.role == worker]
```

### Kubernetes
Each service includes Kubernetes manifests in their respective directories.

### Cloud Deployment
- **AWS**: ECS/EKS with RDS
- **Google Cloud**: GKE with Cloud SQL  
- **Azure**: AKS with Azure Database
- **DigitalOcean**: Kubernetes with Managed Database

## 🛠️ Troubleshooting

### Common Issues

**Services can't communicate:**
```bash
# Check network exists
docker network ls | grep family_network

# Recreate network  
docker network rm family_network
docker network create family_network
```

**Port conflicts:**
```bash
# Check what's using ports
lsof -i :3000
lsof -i :8000  
lsof -i :5432

# Change ports in .env files
```

**Database connection issues:**
```bash
# Check database is ready
docker exec family_portfolio_database pg_isready -U portfolio_admin

# View database logs
docker-compose -f family-portfolio-database/docker-compose.yml logs
```

## 📚 Additional Resources

- [Frontend Documentation](family-portfolio-frontend/README.md)
- [Backend Documentation](family-portfolio-backend/README.md)  
- [Database Documentation](family-portfolio-database/README.md)
- [API Documentation](http://localhost:8000/docs) (when running)

## 🤝 Contributing

1. Fork the repository
2. Create feature branches for each service
3. Make changes in the appropriate service directory
4. Test changes using the management scripts
5. Submit pull requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.