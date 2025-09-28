# Family Portfolio Frontend

A React.js frontend application for managing family heritage and genealogy.

## Features
- Interactive family tree visualization
- Photo management and gallery
- Document archive system
- User profile management
- Responsive design with dark/light themes

## Quick Start

### Using Docker (Recommended)

1. **Create the external network** (run once):
   ```bash
   docker network create family_network
   ```

2. **Start the frontend**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000

### Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

## Configuration

### Environment Variables
- `API_BASE_URL`: Backend API base URL (default: http://localhost:8000)
- `FRONTEND_PORT`: Frontend port (default: 3000)

### Backend Connection
Make sure the backend service is running and accessible at the configured API_BASE_URL.

## Docker Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose build --no-cache
```

## Project Structure
```
src/
├── components/     # Reusable React components
├── context/        # React context providers
├── controllers/    # Business logic controllers
├── views/          # Page-level components
├── services/       # API service functions
└── App.js          # Main application component
```

## Dependencies
- React 18
- Tailwind CSS for styling
- Modern JavaScript (ES6+)

## Building for Production
The Docker setup automatically builds for production with optimized bundles.