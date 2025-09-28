"""Simplified configuration management for Docker compatibility."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    app_name: str = "Family Portfolio API"
    app_version: str = "2.0.0"  # Changed from 'version' to match env var
    environment: str = "development"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 1
    
    # Database (using nested env vars with double underscore)
    database_url: str = "postgresql://portfolio_admin:secure_password_123@family_portfolio_database:5432/family_portfolio"
    database_echo: bool = False
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_pool_timeout: int = 30
    database_pool_recycle: int = 3600
    
    # Security (using nested env vars with double underscore)  
    secret_key: str = "your-super-secret-key-change-in-production-make-it-longer-than-32-characters"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 43200
    password_min_length: int = 8
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 30
    
    # Logging (using nested env vars with double underscore)
    log_level: str = "INFO"
    log_format: str = "json"
    log_file_enabled: bool = False
    log_file_path: str = "./logs/family-portfolio.log"
    log_max_file_size: int = 10 * 1024 * 1024
    log_backup_count: int = 5
    
    # File Upload (using nested env vars with double underscore)
    upload_path: str = "./uploads"
    max_file_size: int = 10 * 1024 * 1024
    allowed_extensions: str = ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
    
    # Redis (using nested env vars with double underscore)
    redis_url: str = "redis://localhost:6379/0"
    redis_max_connections: int = 50
    redis_socket_timeout: int = 5
    redis_retry_on_timeout: bool = True
    
    # CORS
    cors_origins: str = "http://localhost:3000"
    cors_allow_credentials: bool = True
    cors_allow_methods: str = "GET,POST,PUT,DELETE,OPTIONS"
    cors_allow_headers: str = "*"
    
    # Feature flags
    enable_metrics: bool = True
    enable_tracing: bool = True
    enable_rate_limiting: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins as list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
        
    @property  
    def cors_methods_list(self) -> List[str]:
        """Parse CORS methods as list."""
        return [method.strip() for method in self.cors_allow_methods.split(",")]
        
    @property
    def cors_headers_list(self) -> List[str]:
        """Parse CORS headers as list."""
        return [header.strip() for header in self.cors_allow_headers.split(",")]
        
    @property
    def allowed_extensions_list(self) -> List[str]:
        """Parse allowed extensions as list."""
        return [ext.strip() for ext in self.allowed_extensions.split(",")]
        
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"
    
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment == "development"


settings = Settings()