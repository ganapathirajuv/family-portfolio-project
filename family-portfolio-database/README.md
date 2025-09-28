# Family Portfolio Database

PostgreSQL database service for the Family Portfolio application.

## Features
- PostgreSQL 15 with Alpine Linux
- Automatic database initialization
- Health checks and monitoring
- Backup and restore capabilities
- Performance monitoring with pg_stat_statements

## Quick Start

### Using Docker (Recommended)

1. **Create the external network** (run once):
   ```bash
   docker network create family_network
   ```

2. **Start the database**:
   ```bash
   docker-compose up -d
   ```

3. **Access the database**:
   - Host: localhost
   - Port: 5432
   - Database: family_portfolio
   - Username: portfolio_admin
   - Password: secure_password_123

## Configuration

### Environment Variables
- `DB_NAME`: Database name (default: family_portfolio)
- `DB_USER`: Database username (default: portfolio_admin)
- `DB_PASSWORD`: Database password (default: secure_password_123)
- `DB_PORT`: Database port (default: 5432)

## Database Management

### Connect to Database
```bash
# Using Docker exec
docker exec -it family_portfolio_database psql -U portfolio_admin -d family_portfolio

# Using psql client
psql -h localhost -p 5432 -U portfolio_admin -d family_portfolio
```

### Backup Database
```bash
# Create backup
docker exec family_portfolio_database pg_dump -U portfolio_admin -d family_portfolio > ./backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Or using the backup script
./scripts/backup.sh
```

### Restore Database
```bash
# Restore from backup
docker exec -i family_portfolio_database psql -U portfolio_admin -d family_portfolio < ./backups/backup_file.sql

# Or using the restore script
./scripts/restore.sh backup_file.sql
```

## Docker Commands

```bash
# Start database
docker-compose up -d

# View logs
docker-compose logs -f database

# Stop database
docker-compose down

# Stop and remove data (⚠️  WARNING: This will delete all data)
docker-compose down -v
```

## Database Schema

The database includes tables for:
- **family_members**: Core family member information
- **relationships**: Family relationships and connections
- **photos**: Photo metadata and storage information
- **documents**: Document metadata and storage
- **users**: Application user accounts
- **audit_logs**: System audit and activity logs

## Initialization Scripts

Place SQL initialization scripts in the `init/` directory:
- `01-init.sql`: Main database schema
- `02-seed-data.sql`: Sample/seed data (optional)
- `03-indexes.sql`: Database indexes and optimizations

Scripts are executed in alphabetical order during container startup.

## Monitoring

### Performance Statistics
```sql
-- View query statistics
SELECT query, calls, total_time, mean_time, rows 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

### Database Size
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('family_portfolio')) as db_size;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Security

### Production Recommendations
1. Change default passwords in `.env`
2. Use strong, unique passwords
3. Limit network access using Docker networks
4. Regular security updates
5. Enable SSL/TLS connections
6. Regular backups

### Connection Security
```bash
# Generate strong password
openssl rand -base64 32

# Update .env file with new credentials
```

## Troubleshooting

### Common Issues

**Connection Refused:**
```bash
# Check if container is running
docker ps | grep family_portfolio_database

# Check logs for errors
docker-compose logs database
```

**Permission Issues:**
```bash
# Fix volume permissions
docker-compose down
docker volume rm family-portfolio-database_postgres_data
docker-compose up -d
```

**Out of Disk Space:**
```bash
# Check volume usage
docker system df

# Clean up old data
docker system prune -f
```