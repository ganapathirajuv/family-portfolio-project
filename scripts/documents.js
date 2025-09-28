// Documents management functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeDocuments();
});

function initializeDocuments() {
    setupDocumentUpload();
    renderDocuments();
}

function setupDocumentUpload() {
    const uploadArea = document.getElementById('upload-area');
    const documentInput = document.getElementById('document-input');

    // Click to browse files
    uploadArea.addEventListener('click', function() {
        documentInput.click();
    });

    // File input change
    documentInput.addEventListener('change', function(e) {
        handleDocumentFiles(e.target.files);
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleDocumentFiles(e.dataTransfer.files);
    });
}

function handleDocumentFiles(files) {
    if (files.length === 0) return;

    const documents = loadFromStorage('documents') || [];
    let filesProcessed = 0;

    Array.from(files).forEach(file => {
        // Validate file type
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            showError(`File type ${fileExtension} is not supported`);
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError(`File ${file.name} is too large. Maximum size is 10MB`);
            return;
        }

        // Create document object
        const document = {
            id: generateId(),
            name: file.name,
            type: fileExtension.slice(1),
            size: file.size,
            category: categorizeDocument(file.name),
            uploadDate: new Date().toISOString(),
            file: file // In a real app, this would be uploaded to a server
        };

        // For demo purposes, create a data URL for certain file types
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.preview = e.target.result;
                documents.push(document);
                saveToStorage('documents', documents);
                
                filesProcessed++;
                if (filesProcessed === files.length) {
                    renderDocuments();
                    showSuccess(`${files.length} document(s) uploaded successfully`);
                }
            };
            reader.readAsDataURL(file);
        } else {
            documents.push(document);
            filesProcessed++;
        }
    });

    // Save and render for non-image files
    if (filesProcessed > 0) {
        saveToStorage('documents', documents);
        renderDocuments();
        showSuccess(`${filesProcessed} document(s) uploaded successfully`);
    }

    // Clear the file input
    document.getElementById('document-input').value = '';
}

function categorizeDocument(filename) {
    const name = filename.toLowerCase();
    
    if (name.includes('birth') || name.includes('certificate') || name.includes('license') || name.includes('passport')) {
        return 'official';
    } else if (name.includes('photo') || name.includes('picture') || name.includes('image')) {
        return 'photos';
    } else if (name.includes('history') || name.includes('genealogy') || name.includes('family')) {
        return 'history';
    } else if (name.includes('medical') || name.includes('health')) {
        return 'medical';
    } else {
        return 'general';
    }
}

function renderDocuments() {
    const documentsGrid = document.getElementById('documents-grid');
    const documents = loadFromStorage('documents') || [];

    if (documents.length === 0) {
        documentsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No Documents Yet</h3>
                <p>Upload your first family document to get started</p>
            </div>
        `;
        return;
    }

    documentsGrid.innerHTML = '';

    documents.forEach(doc => {
        const documentElement = createDocumentElement(doc);
        documentsGrid.appendChild(documentElement);
    });
}

function createDocumentElement(doc) {
    const element = document.createElement('div');
    element.className = 'document-item';
    element.dataset.documentId = doc.id;

    const categoryClass = getCategoryClass(doc.category);
    const fileIcon = getFileIcon(doc.type);
    const fileSize = formatFileSize(doc.size);
    const uploadDate = formatDate(doc.uploadDate);

    element.innerHTML = `
        <div class="document-preview">
            ${doc.preview ? 
                `<img src="${doc.preview}" alt="${doc.name}" class="preview-image">` :
                `<div class="document-icon ${categoryClass}">
                    <i class="${fileIcon}"></i>
                </div>`
            }
        </div>
        <div class="document-info">
            <h4 class="document-name" title="${doc.name}">${truncateText(doc.name, 20)}</h4>
            <p class="document-meta">
                <span class="file-size">${fileSize}</span>
                <span class="upload-date">${uploadDate}</span>
            </p>
            <div class="document-category">
                <span class="category-badge ${categoryClass}">${formatCategory(doc.category)}</span>
            </div>
        </div>
        <div class="document-actions">
            <button class="action-btn download-btn" onclick="downloadDocument('${doc.id}')" title="Download">
                <i class="fas fa-download"></i>
            </button>
            <button class="action-btn view-btn" onclick="viewDocument('${doc.id}')" title="View">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteDocument('${doc.id}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return element;
}

function getCategoryClass(category) {
    const classes = {
        'official': 'category-official',
        'photos': 'category-photos',
        'history': 'category-history',
        'medical': 'category-medical',
        'general': 'category-general'
    };
    
    return classes[category] || 'category-general';
}

function formatCategory(category) {
    const labels = {
        'official': 'Official',
        'photos': 'Photos',
        'history': 'History',
        'medical': 'Medical',
        'general': 'General'
    };
    
    return labels[category] || 'General';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function truncateText(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

function downloadDocument(documentId) {
    const documents = loadFromStorage('documents') || [];
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
        showError('Document not found');
        return;
    }

    // In a real application, this would download from a server
    // For demo purposes, we'll show a message
    showSuccess(`Download started for ${document.name}`);
    
    // If it's an image with preview data, we can actually download it
    if (document.preview) {
        const link = document.createElement('a');
        link.href = document.preview;
        link.download = document.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function viewDocument(documentId) {
    const documents = loadFromStorage('documents') || [];
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
        showError('Document not found');
        return;
    }

    if (document.preview) {
        // Show image in modal
        showDocumentModal(document);
    } else {
        // For non-image files, show info modal
        showDocumentInfoModal(document);
    }
}

function showDocumentModal(document) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content document-modal-content">
            <span class="close">&times;</span>
            <div class="document-viewer">
                <img src="${document.preview}" alt="${document.name}" class="document-full-image">
                <div class="document-details">
                    <h3>${document.name}</h3>
                    <p><strong>Category:</strong> ${formatCategory(document.category)}</p>
                    <p><strong>Size:</strong> ${formatFileSize(document.size)}</p>
                    <p><strong>Uploaded:</strong> ${formatDate(document.uploadDate)}</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Close functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = 'auto';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    });

    document.body.style.overflow = 'hidden';
}

function showDocumentInfoModal(document) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="document-info-modal">
                <div class="document-icon-large ${getCategoryClass(document.category)}">
                    <i class="${getFileIcon(document.type)}"></i>
                </div>
                <h3>${document.name}</h3>
                <div class="document-details">
                    <p><strong>Type:</strong> ${document.type.toUpperCase()}</p>
                    <p><strong>Category:</strong> ${formatCategory(document.category)}</p>
                    <p><strong>Size:</strong> ${formatFileSize(document.size)}</p>
                    <p><strong>Uploaded:</strong> ${formatDate(document.uploadDate)}</p>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="downloadDocument('${document.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Close functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = 'auto';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    });

    document.body.style.overflow = 'hidden';
}

function deleteDocument(documentId) {
    const documents = loadFromStorage('documents') || [];
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
        showError('Document not found');
        return;
    }

    if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
        const updatedDocuments = documents.filter(doc => doc.id !== documentId);
        saveToStorage('documents', updatedDocuments);
        renderDocuments();
        showSuccess(`${document.name} has been deleted`);
    }
}

// Add document-specific styles
const documentStyles = `
    .drag-over {
        border-color: #764ba2 !important;
        background-color: rgba(102, 126, 234, 0.1) !important;
    }
    
    .document-item {
        background: white;
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        position: relative;
    }
    
    .document-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }
    
    .document-preview {
        margin-bottom: 1rem;
        text-align: center;
    }
    
    .preview-image {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .document-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: white;
    }
    
    .document-icon-large {
        width: 80px;
        height: 80px;
        margin: 0 auto 1rem;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        color: white;
    }
    
    .category-official { background: #3498db; }
    .category-photos { background: #e74c3c; }
    .category-history { background: #f39c12; }
    .category-medical { background: #27ae60; }
    .category-general { background: #9b59b6; }
    
    .document-name {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: #333;
    }
    
    .document-meta {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.5rem;
    }
    
    .file-size::after {
        content: ' • ';
        margin: 0 0.3rem;
    }
    
    .category-badge {
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
        color: white;
        font-weight: bold;
    }
    
    .document-actions {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        display: flex;
        gap: 0.3rem;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .document-item:hover .document-actions {
        opacity: 1;
    }
    
    .action-btn {
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        transition: all 0.2s ease;
    }
    
    .download-btn { background: #3498db; color: white; }
    .download-btn:hover { background: #2980b9; }
    
    .view-btn { background: #27ae60; color: white; }
    .view-btn:hover { background: #219a52; }
    
    .delete-btn { background: #e74c3c; color: white; }
    .delete-btn:hover { background: #c0392b; }
    
    .document-full-image {
        max-width: 100%;
        max-height: 60vh;
        object-fit: contain;
        border-radius: 10px;
        margin-bottom: 1rem;
    }
    
    .document-info-modal {
        text-align: center;
    }
    
    .document-details {
        margin: 1rem 0;
        text-align: left;
    }
    
    .modal-actions {
        margin-top: 2rem;
        text-align: center;
    }
    
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: #666;
    }
`;

// Inject styles
const documentStyleSheet = document.createElement('style');
documentStyleSheet.textContent = documentStyles;
document.head.appendChild(documentStyleSheet);