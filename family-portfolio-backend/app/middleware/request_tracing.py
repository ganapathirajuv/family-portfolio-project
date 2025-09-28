"""Request tracing middleware for distributed tracing and correlation."""

import uuid
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class RequestTracingMiddleware(BaseHTTPMiddleware):
    """Middleware for request tracing and correlation ID injection."""
    
    def __init__(self, app: ASGIApp, trace_header: str = "X-Trace-ID"):
        super().__init__(app)
        self.trace_header = trace_header
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with tracing information."""
        
        # Get or generate trace ID
        trace_id = self._get_trace_id(request)
        
        # Store in request state for access by other components
        request.state.trace_id = trace_id
        request.state.start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Add trace ID to response headers
        response.headers[self.trace_header] = trace_id
        response.headers["X-Request-ID"] = getattr(request.state, 'request_id', trace_id)
        
        # Add timing information
        if hasattr(request.state, 'start_time'):
            process_time = time.time() - request.state.start_time
            response.headers["X-Process-Time"] = f"{process_time:.4f}"
        
        return response
    
    def _get_trace_id(self, request: Request) -> str:
        """Get existing trace ID from headers or generate new one."""
        
        # Check for existing trace ID in headers
        trace_id = request.headers.get(self.trace_header)
        if trace_id:
            return trace_id
            
        # Check for other common tracing headers
        for header in ["X-Request-ID", "X-Correlation-ID", "X-Amzn-Trace-Id"]:
            trace_id = request.headers.get(header)
            if trace_id:
                return trace_id
                
        # Generate new trace ID
        return str(uuid.uuid4())