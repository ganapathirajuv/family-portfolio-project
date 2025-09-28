"""Dependency injection container for the Family Portfolio API."""

from typing import Dict, TypeVar, Type, Callable, Any
from abc import ABC, abstractmethod
import inspect


T = TypeVar('T')


class DIContainer:
    """Simple dependency injection container."""
    
    def __init__(self):
        self._services: Dict[Type, Any] = {}
        self._singletons: Dict[Type, Any] = {}
        self._factories: Dict[Type, Callable] = {}
        
    def register_singleton(self, interface: Type[T], implementation: Type[T]) -> None:
        """Register a singleton service."""
        self._services[interface] = implementation
        
    def register_transient(self, interface: Type[T], implementation: Type[T]) -> None:
        """Register a transient service (new instance each time)."""
        self._factories[interface] = implementation
        
    def register_instance(self, interface: Type[T], instance: T) -> None:
        """Register an existing instance."""
        self._singletons[interface] = instance
        
    def resolve(self, service_type: Type[T]) -> T:
        """Resolve a service instance."""
        
        # Check if already instantiated singleton
        if service_type in self._singletons:
            return self._singletons[service_type]
            
        # Check if it's a registered singleton
        if service_type in self._services:
            implementation = self._services[service_type]
            instance = self._create_instance(implementation)
            self._singletons[service_type] = instance
            return instance
            
        # Check if it's a transient service
        if service_type in self._factories:
            implementation = self._factories[service_type]
            return self._create_instance(implementation)
            
        # Try to create instance directly
        return self._create_instance(service_type)
        
    def _create_instance(self, implementation: Type[T]) -> T:
        """Create an instance with dependency injection."""
        
        # Get constructor signature
        signature = inspect.signature(implementation.__init__)
        
        # Build constructor arguments
        kwargs = {}
        for param_name, param in signature.parameters.items():
            if param_name == 'self':
                continue
                
            if param.annotation != inspect.Parameter.empty:
                kwargs[param_name] = self.resolve(param.annotation)
                
        return implementation(**kwargs)


# Global container instance
container = DIContainer()