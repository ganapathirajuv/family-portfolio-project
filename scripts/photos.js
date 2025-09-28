// Photo gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    initializePhotos();
});

let currentFilter = 'all';

function initializePhotos() {
    setupPhotoUpload();
    setupPhotoFilters();
    renderPhotoGallery();
}

function setupPhotoUpload() {
    const uploadArea = document.getElementById('photo-upload-area');
    const photoInput = document.getElementById('photo-input');

    // Click to browse files
    uploadArea.addEventListener('click', function() {
        photoInput.click();
    });

    // File input change
    photoInput.addEventListener('change', function(e) {
        handlePhotoFiles(e.target.files);
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
        handlePhotoFiles(e.dataTransfer.files);
    });
}

function setupPhotoFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active filter button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update current filter and re-render
            currentFilter = this.dataset.filter;
            renderPhotoGallery();
        });
    });
}

function handlePhotoFiles(files) {
    if (files.length === 0) return;

    const photos = loadFromStorage('photos') || [];
    let filesProcessed = 0;
    const totalFiles = files.length;

    Array.from(files).forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError(`${file.name} is not a valid image file`);
            filesProcessed++;
            if (filesProcessed === totalFiles) {
                checkCompletionAndRender(photos, totalFiles - (totalFiles - photos.length));
            }
            return;
        }

        // Validate file size (max 5MB for photos)
        if (file.size > 5 * 1024 * 1024) {
            showError(`${file.name} is too large. Maximum size is 5MB`);
            filesProcessed++;
            if (filesProcessed === totalFiles) {
                checkCompletionAndRender(photos, totalFiles - (totalFiles - photos.length));
            }
            return;
        }

        // Create photo object
        const reader = new FileReader();
        reader.onload = function(e) {
            const photo = {
                id: generateId(),
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                src: e.target.result,
                category: categorizePhoto(file.name),
                uploadDate: new Date().toISOString(),
                size: file.size,
                filename: file.name
            };

            photos.push(photo);
            filesProcessed++;

            if (filesProcessed === totalFiles) {
                saveToStorage('photos', photos);
                renderPhotoGallery();
                showSuccess(`${photos.length - (loadFromStorage('photos') || []).length + totalFiles} photo(s) uploaded successfully`);
            }
        };

        reader.onerror = function() {
            showError(`Error reading ${file.name}`);
            filesProcessed++;
            if (filesProcessed === totalFiles) {
                checkCompletionAndRender(photos, totalFiles - (totalFiles - photos.length));
            }
        };

        reader.readAsDataURL(file);
    });

    // Clear the file input
    document.getElementById('photo-input').value = '';
}

function checkCompletionAndRender(photos, successCount) {
    if (successCount > 0) {
        saveToStorage('photos', photos);
        renderPhotoGallery();
        showSuccess(`${successCount} photo(s) uploaded successfully`);
    }
}

function categorizePhoto(filename) {
    const name = filename.toLowerCase();
    
    if (name.includes('wedding') || name.includes('birthday') || name.includes('graduation') || 
        name.includes('anniversary') || name.includes('party') || name.includes('celebration')) {
        return 'events';
    } else if (name.includes('vacation') || name.includes('trip') || name.includes('travel') || 
               name.includes('holiday') || name.includes('beach') || name.includes('mountain')) {
        return 'vacations';
    } else if (name.includes('portrait') || name.includes('headshot') || name.includes('profile')) {
        return 'portraits';
    } else {
        return 'all';
    }
}

function renderPhotoGallery() {
    const photoGrid = document.getElementById('photo-grid');
    const photos = loadFromStorage('photos') || [];

    // Filter photos based on current filter
    const filteredPhotos = currentFilter === 'all' 
        ? photos 
        : photos.filter(photo => photo.category === currentFilter);

    if (filteredPhotos.length === 0) {
        const emptyMessage = currentFilter === 'all' 
            ? 'No photos yet. Upload your first family photo to get started!'
            : `No photos in the "${currentFilter}" category yet.`;
            
        photoGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No Photos Found</h3>
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }

    photoGrid.innerHTML = '';

    filteredPhotos.forEach(photo => {
        const photoElement = createPhotoElement(photo);
        photoGrid.appendChild(photoElement);
    });
}

function createPhotoElement(photo) {
    const element = document.createElement('div');
    element.className = 'photo-item';
    element.dataset.photoId = photo.id;

    element.innerHTML = `
        <img src="${photo.src}" alt="${photo.title}" loading="lazy">
        <div class="photo-overlay">
            <h4 class="photo-title">${photo.title}</h4>
            <p class="photo-date">${formatDate(photo.uploadDate)}</p>
            <div class="photo-actions">
                <button class="photo-action-btn" onclick="viewPhoto('${photo.id}')" title="View">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="photo-action-btn" onclick="editPhoto('${photo.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="photo-action-btn delete-photo" onclick="deletePhoto('${photo.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    // Add click handler to view photo
    element.addEventListener('click', function(e) {
        if (!e.target.closest('.photo-actions')) {
            viewPhoto(photo.id);
        }
    });

    return element;
}

function viewPhoto(photoId) {
    const photos = loadFromStorage('photos') || [];
    const photo = photos.find(p => p.id === photoId);
    
    if (!photo) {
        showError('Photo not found');
        return;
    }

    // Show photo in modal
    const modal = document.getElementById('photo-modal');
    const modalPhoto = document.getElementById('modal-photo');
    const photoTitle = document.getElementById('photo-title');
    const photoDescription = document.getElementById('photo-description');

    modalPhoto.src = photo.src;
    modalPhoto.alt = photo.title;
    photoTitle.textContent = photo.title;
    photoDescription.innerHTML = `
        <strong>Category:</strong> ${formatCategory(photo.category)}<br>
        <strong>Uploaded:</strong> ${formatDate(photo.uploadDate)}<br>
        <strong>Size:</strong> ${formatFileSize(photo.size)}
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Setup navigation between photos
    setupPhotoNavigation(photoId, modal);
}

function setupPhotoNavigation(currentPhotoId, modal) {
    const photos = loadFromStorage('photos') || [];
    const filteredPhotos = currentFilter === 'all' 
        ? photos 
        : photos.filter(photo => photo.category === currentFilter);
    
    const currentIndex = filteredPhotos.findIndex(p => p.id === currentPhotoId);
    
    // Remove existing navigation buttons
    const existingNav = modal.querySelector('.photo-navigation');
    if (existingNav) {
        existingNav.remove();
    }

    // Add navigation if there are multiple photos
    if (filteredPhotos.length > 1) {
        const navigation = document.createElement('div');
        navigation.className = 'photo-navigation';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-btn prev-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentIndex === 0;
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'nav-btn next-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentIndex === filteredPhotos.length - 1;
        
        const counter = document.createElement('span');
        counter.className = 'photo-counter';
        counter.textContent = `${currentIndex + 1} of ${filteredPhotos.length}`;
        
        navigation.appendChild(prevBtn);
        navigation.appendChild(counter);
        navigation.appendChild(nextBtn);
        
        modal.querySelector('.modal-content').appendChild(navigation);
        
        // Add navigation event listeners
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                viewPhoto(filteredPhotos[currentIndex - 1].id);
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < filteredPhotos.length - 1) {
                viewPhoto(filteredPhotos[currentIndex + 1].id);
            }
        });
    }

    // Keyboard navigation
    const handleKeyPress = (e) => {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            viewPhoto(filteredPhotos[currentIndex - 1].id);
        } else if (e.key === 'ArrowRight' && currentIndex < filteredPhotos.length - 1) {
            viewPhoto(filteredPhotos[currentIndex + 1].id);
        } else if (e.key === 'Escape') {
            closeModal(modal);
            document.removeEventListener('keydown', handleKeyPress);
        }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    
    // Remove event listener when modal closes
    const originalClose = modal.querySelector('.close').onclick;
    modal.querySelector('.close').onclick = function() {
        document.removeEventListener('keydown', handleKeyPress);
        closeModal(modal);
    };
}

function editPhoto(photoId) {
    const photos = loadFromStorage('photos') || [];
    const photo = photos.find(p => p.id === photoId);
    
    if (!photo) {
        showError('Photo not found');
        return;
    }

    // Create edit modal
    const editModal = document.createElement('div');
    editModal.className = 'modal';
    editModal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Edit Photo</h3>
            <form id="edit-photo-form">
                <div class="form-group">
                    <label for="edit-photo-title">Title:</label>
                    <input type="text" id="edit-photo-title" value="${photo.title}" required>
                </div>
                <div class="form-group">
                    <label for="edit-photo-category">Category:</label>
                    <select id="edit-photo-category" required>
                        <option value="all" ${photo.category === 'all' ? 'selected' : ''}>General</option>
                        <option value="events" ${photo.category === 'events' ? 'selected' : ''}>Events</option>
                        <option value="portraits" ${photo.category === 'portraits' ? 'selected' : ''}>Portraits</option>
                        <option value="vacations" ${photo.category === 'vacations' ? 'selected' : ''}>Vacations</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Save Changes</button>
                    <button type="button" class="btn-secondary cancel-edit">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(editModal);
    editModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Form submission
    const form = editModal.querySelector('#edit-photo-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newTitle = document.getElementById('edit-photo-title').value.trim();
        const newCategory = document.getElementById('edit-photo-category').value;
        
        if (!newTitle) {
            showError('Please enter a title');
            return;
        }

        // Update photo
        photo.title = newTitle;
        photo.category = newCategory;
        
        saveToStorage('photos', photos);
        renderPhotoGallery();
        
        editModal.remove();
        document.body.style.overflow = 'auto';
        showSuccess('Photo updated successfully');
    });

    // Close functionality
    const closeBtn = editModal.querySelector('.close');
    const cancelBtn = editModal.querySelector('.cancel-edit');
    
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            editModal.remove();
            document.body.style.overflow = 'auto';
        });
    });

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

function deletePhoto(photoId) {
    const photos = loadFromStorage('photos') || [];
    const photo = photos.find(p => p.id === photoId);
    
    if (!photo) {
        showError('Photo not found');
        return;
    }

    if (confirm(`Are you sure you want to delete "${photo.title}"?`)) {
        const updatedPhotos = photos.filter(p => p.id !== photoId);
        saveToStorage('photos', updatedPhotos);
        renderPhotoGallery();
        showSuccess(`${photo.title} has been deleted`);
    }
}

function formatCategory(category) {
    const labels = {
        'all': 'General',
        'events': 'Events',
        'portraits': 'Portraits',
        'vacations': 'Vacations'
    };
    
    return labels[category] || 'General';
}

// Add photo-specific styles
const photoStyles = `
    .photo-item {
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        aspect-ratio: 1;
    }
    
    .photo-item:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .photo-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .photo-item:hover img {
        transform: scale(1.1);
    }
    
    .photo-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.8));
        color: white;
        padding: 1rem;
        transform: translateY(100%);
        transition: transform 0.3s ease;
    }
    
    .photo-item:hover .photo-overlay {
        transform: translateY(0);
    }
    
    .photo-title {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: bold;
    }
    
    .photo-date {
        margin: 0 0 0.5rem 0;
        font-size: 0.8rem;
        opacity: 0.8;
    }
    
    .photo-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .photo-action-btn {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .photo-action-btn:hover {
        background: rgba(255,255,255,0.3);
        transform: scale(1.1);
    }
    
    .delete-photo:hover {
        background: rgba(231, 76, 60, 0.8);
    }
    
    .photo-navigation {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 1rem;
        background: rgba(0,0,0,0.7);
        padding: 0.5rem 1rem;
        border-radius: 25px;
    }
    
    .nav-btn {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s ease;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .nav-btn:not(:disabled):hover {
        background: rgba(255,255,255,0.2);
    }
    
    .nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
    
    .photo-counter {
        color: white;
        font-size: 0.9rem;
        min-width: 80px;
        text-align: center;
    }
    
    .photo-modal-content {
        position: relative;
        max-width: 95vw;
        max-height: 95vh;
        padding: 1rem;
    }
    
    .photo-modal-content img {
        max-width: 100%;
        max-height: calc(95vh - 200px);
        object-fit: contain;
    }
    
    .photo-info {
        padding: 1rem;
        background: rgba(0,0,0,0.1);
        border-radius: 10px;
        margin-top: 1rem;
    }
    
    .photo-info h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
    }
    
    .photo-info p {
        margin: 0;
        color: #666;
        line-height: 1.4;
    }
    
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: #666;
    }
    
    .empty-state h3 {
        margin: 1rem 0;
        color: #333;
    }
    
    @media (max-width: 768px) {
        .photo-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
        
        .photo-navigation {
            bottom: 10px;
            padding: 0.3rem 0.7rem;
        }
        
        .nav-btn {
            width: 35px;
            height: 35px;
            font-size: 1rem;
        }
        
        .photo-counter {
            font-size: 0.8rem;
            min-width: 60px;
        }
    }
`;

// Inject styles
const photoStyleSheet = document.createElement('style');
photoStyleSheet.textContent = photoStyles;
document.head.appendChild(photoStyleSheet);