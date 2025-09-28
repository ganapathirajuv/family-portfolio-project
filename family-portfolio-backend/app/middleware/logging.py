"""Structured logging middleware for FastAPI."""

import time
import uuid
import json
import logging
from typing import Callable, Dict, Any

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for structured request/response logging."""
    
    def __init__(self, app: ASGIApp, logger: logging.Logger = None):
        super().__init__(app)
        self.logger = logger or logging.getLogger(__name__)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and log details."""
        
        # Generate request ID for tracing
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timing
        start_time = time.time()
        
        # Log request
        await self._log_request(request, request_id)
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            process_time = time.time() - start_time
            
            # Log response
            await self._log_response(request, response, request_id, process_time)
            
            # Add timing header
            response.headers["X-Process-Time"] = str(process_time)
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as exc:
            # Calculate duration
            process_time = time.time() - start_time
            
            # Log error
            await self._log_error(request, exc, request_id, process_time)
            
            raise
    
    async def _log_request(self, request: Request, request_id: str) -> None:
        """Log incoming request details."""
        
        # Get request body if available (for POST/PUT requests)
        body = None
        if request.method in ("POST", "PUT", "PATCH"):
            try:
                body = await request.body()
                # Reset stream for actual processing
                request._body = body
            except Exception:
                body = None
                
        log_data = {
            "event": "request_started",
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "headers": dict(request.headers),
            "client_ip": self._get_client_ip(request),
            "user_agent": request.headers.get("user-agent"),
            "content_type": request.headers.get("content-type"),
            "content_length": request.headers.get("content-length"),
        }
        
        # Add body for debug mode (be careful with sensitive data)
        if body and len(body) < 1024:  # Only log small bodies
            try:
                log_data["body"] = body.decode("utf-8")
            except UnicodeDecodeError:
                log_data["body"] = "<binary data>"
                
        self.logger.info(json.dumps(log_data))
    
    async def _log_response(
        self, 
        request: Request, 
        response: Response, 
        request_id: str, 
        process_time: float
    ) -> None:
        """Log response details."""
        
        log_data = {
            "event": "request_completed",
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time": process_time,
            "response_headers": dict(response.headers) if hasattr(response, 'headers') else {},
        }
        
        # Log level based on status code
        if response.status_code >= 500:
            self.logger.error(json.dumps(log_data))
        elif response.status_code >= 400:
            self.logger.warning(json.dumps(log_data))
        else:
            self.logger.info(json.dumps(log_data))
    
    async def _log_error(
        self, 
        request: Request, 
        exc: Exception, 
        request_id: str, 
        process_time: float
    ) -> None:
        """Log error details."""
        
        log_data = {
            "event": "request_failed",
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "process_time": process_time,
        }
        
        self.logger.error(json.dumps(log_data), exc_info=True)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address, considering proxy headers."""
        
        # Check for forwarded headers (common in load balancers/proxies)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # X-Forwarded-For can contain multiple IPs, take the first one
            return forwarded_for.split(",")[0].strip()
            
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
            
        # Fall back to direct connection IP
        client_host = getattr(request.client, "host", None) if request.client else None
        return client_host or "unknown"


def setup_logging(log_level: str = "INFO", log_format: str = "json") -> logging.Logger:
    """Setup structured logging configuration."""
    
    logger = logging.getLogger("family_portfolio")
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Create console handler
    handler = logging.StreamHandler()
    
    if log_format.lower() == "json":
        # JSON formatter for structured logging
        formatter = JsonFormatter()
    else:
        # Standard formatter
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    # Prevent duplicate logs
    logger.propagate = False
    
    return logger


class JsonFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
            
        # Add extra fields
        for key, value in record.__dict__.items():
            if key not in ("name", "msg", "args", "levelname", "levelno", "pathname", 
                          "filename", "module", "lineno", "funcName", "created", 
                          "msecs", "relativeCreated", "thread", "threadName", 
                          "processName", "process", "getMessage", "exc_info", "exc_text", 
                          "stack_info"):
                log_entry[key] = value
                
        return json.dumps(log_entry, default=str)