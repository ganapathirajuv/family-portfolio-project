// Main navigation and app initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupModals();
    loadInitialData();
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.dataset.section;
            
            // Update active nav link
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // Update URL hash
            window.location.hash = targetSection;
        });
    });

    // Handle initial hash navigation
    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);
}

function handleHashNavigation() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        const targetLink = document.querySelector(`[data-section="${hash}"]`);
        if (targetLink) {
            targetLink.click();
        }
    }
}

// Modal functionality
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    // Close modal when clicking close button
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form if it exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Local storage helpers
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// Initialize sample data if none exists
function loadInitialData() {
    // Initialize family members if none exist
    const familyMembers = loadFromStorage('familyMembers');
    if (!familyMembers || familyMembers.length === 0) {
        const sampleMembers = [
            {
                id: 1,
                name: 'John Doe',
                relation: 'self',
                birthYear: 1980,
                x: 50,
                y: 50
            },
            {
                id: 2,
                name: 'Jane Doe',
                relation: 'spouse',
                birthYear: 1982,
                x: 70,
                y: 50
            },
            {
                id: 3,
                name: 'Mike Doe',
                relation: 'child',
                birthYear: 2005,
                x: 60,
                y: 70
            }
        ];
        saveToStorage('familyMembers', sampleMembers);
    }

    // Initialize sample documents
    const documents = loadFromStorage('documents');
    if (!documents || documents.length === 0) {
        const sampleDocs = [
            {
                id: 1,
                name: 'Birth Certificate.pdf',
                type: 'pdf',
                category: 'official',
                uploadDate: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Family History.docx',
                type: 'docx',
                category: 'history',
                uploadDate: new Date().toISOString()
            }
        ];
        saveToStorage('documents', sampleDocs);
    }

    // Initialize sample photos
    const photos = loadFromStorage('photos');
    if (!photos || photos.length === 0) {
        const samplePhotos = [
            {
                id: 1,
                title: 'Family Vacation 2023',
                category: 'vacations',
                uploadDate: new Date().toISOString(),
                src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0xMDAgNDBMMTIwIDgwSDgwTDEwMCA0MFoiIGZpbGw9IiM2NjdFRUEiLz4KPGF4aXMgY3g9IjEwMCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM3NjRCQTIiLz4KPHR4dCB4PSIxMDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GYW1pbHkgUGhvdG88L3R4dD4KPC9zdmc+'
            },
            {
                id: 2,
                title: 'Wedding Anniversary',
                category: 'events',
                uploadDate: new Date().toISOString(),
                src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNjBMMTEwIDkwSDkwTDEwMCA2MFoiIGZpbGw9IiNGRjY5QjQiLz4KPGF4aXMgY3g9IjEwMCIgY3k9IjEyMCIgcj0iMTUiIGZpbGw9IiNFRjQ0NDQiLz4KPHR4dCB4PSIxMDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XZWRkaW5nPC90eHQ+Cjwvc3ZnPg=='
            }
        ];
        saveToStorage('photos', samplePhotos);
    }
}

// Utility functions
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getFileIcon(fileType) {
    const icons = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'txt': 'fas fa-file-alt',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image'
    };
    
    return icons[fileType.toLowerCase()] || 'fas fa-file';
}

// Show loading state
function showLoading(element) {
    const loadingHtml = '<div class="loading"></div>';
    element.innerHTML = loadingHtml;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 2000;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 2000;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}