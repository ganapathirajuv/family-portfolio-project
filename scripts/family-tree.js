// Family Tree functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeFamilyTree();
});

function initializeFamilyTree() {
    setupFamilyTreeControls();
    renderFamilyTree();
}

function setupFamilyTreeControls() {
    const addMemberBtn = document.getElementById('add-member-btn');
    const resetTreeBtn = document.getElementById('reset-tree-btn');
    const familyMemberForm = document.getElementById('family-member-form');
    const cancelMemberBtn = document.getElementById('cancel-member');

    // Add member button
    addMemberBtn.addEventListener('click', function() {
        showModal('family-member-modal');
    });

    // Reset tree button
    resetTreeBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the family tree view?')) {
            renderFamilyTree();
            showSuccess('Family tree view has been reset');
        }
    });

    // Form submission
    familyMemberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addFamilyMember();
    });

    // Cancel button
    cancelMemberBtn.addEventListener('click', function() {
        closeModal(document.getElementById('family-member-modal'));
    });
}

function addFamilyMember() {
    const name = document.getElementById('member-name').value.trim();
    const relation = document.getElementById('member-relation').value;
    const birthYear = document.getElementById('member-birth-year').value;

    if (!name || !relation) {
        showError('Please fill in all required fields');
        return;
    }

    const familyMembers = loadFromStorage('familyMembers') || [];
    
    const newMember = {
        id: generateId(),
        name: name,
        relation: relation,
        birthYear: birthYear ? parseInt(birthYear) : null,
        x: Math.random() * 80 + 10, // Random position between 10% and 90%
        y: Math.random() * 80 + 10
    };

    familyMembers.push(newMember);
    saveToStorage('familyMembers', familyMembers);

    closeModal(document.getElementById('family-member-modal'));
    renderFamilyTree();
    showSuccess(`${name} has been added to the family tree`);
}

function renderFamilyTree() {
    const container = document.getElementById('family-tree-viz');
    const familyMembers = loadFromStorage('familyMembers') || [];

    if (familyMembers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No Family Members Yet</h3>
                <p>Click "Add Family Member" to start building your family tree</p>
            </div>
        `;
        return;
    }

    // Clear container and set up as relative positioned container
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.minHeight = '500px';
    container.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';

    // Create family member elements
    familyMembers.forEach(member => {
        const memberElement = createFamilyMemberElement(member);
        container.appendChild(memberElement);
    });

    // Draw connections between family members
    drawFamilyConnections(container, familyMembers);
}

function createFamilyMemberElement(member) {
    const element = document.createElement('div');
    element.className = 'family-member';
    element.style.position = 'absolute';
    element.style.left = `${member.x}%`;
    element.style.top = `${member.y}%`;
    element.style.transform = 'translate(-50%, -50%)';
    element.dataset.memberId = member.id;

    const age = member.birthYear ? new Date().getFullYear() - member.birthYear : '';
    const ageText = age ? ` (${age})` : '';

    element.innerHTML = `
        <div class="member-avatar">
            <i class="fas fa-user"></i>
        </div>
        <h4>${member.name}</h4>
        <p>${formatRelation(member.relation)}${ageText}</p>
        <div class="member-actions">
            <button class="btn-edit" onclick="editFamilyMember('${member.id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete" onclick="deleteFamilyMember('${member.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Make draggable
    makeDraggable(element, member);

    return element;
}

function makeDraggable(element, member) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    element.addEventListener('mousedown', function(e) {
        if (e.target.closest('.member-actions')) return; // Don't drag when clicking actions
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = element.getBoundingClientRect();
        const container = element.parentElement.getBoundingClientRect();
        
        startLeft = ((rect.left + rect.width/2 - container.left) / container.width) * 100;
        startTop = ((rect.top + rect.height/2 - container.top) / container.height) * 100;
        
        element.style.cursor = 'grabbing';
        element.style.zIndex = '1000';
        
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        const container = element.parentElement.getBoundingClientRect();
        const deltaX = ((e.clientX - startX) / container.width) * 100;
        const deltaY = ((e.clientY - startY) / container.height) * 100;
        
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        // Keep within bounds
        newLeft = Math.max(5, Math.min(95, newLeft));
        newTop = Math.max(5, Math.min(95, newTop));
        
        element.style.left = `${newLeft}%`;
        element.style.top = `${newTop}%`;
    });

    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        
        isDragging = false;
        element.style.cursor = 'pointer';
        element.style.zIndex = 'auto';
        
        // Update member position in storage
        const rect = element.getBoundingClientRect();
        const container = element.parentElement.getBoundingClientRect();
        
        member.x = ((rect.left + rect.width/2 - container.left) / container.width) * 100;
        member.y = ((rect.top + rect.height/2 - container.top) / container.height) * 100;
        
        updateFamilyMemberPosition(member.id, member.x, member.y);
    });
}

function drawFamilyConnections(container, members) {
    // Simple connection logic - connect parents to children, spouses to each other
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '1';
    
    const containerRect = container.getBoundingClientRect();
    
    // Find relationships and draw lines
    members.forEach(member => {
        if (member.relation === 'child') {
            // Find parents
            const parents = members.filter(m => m.relation === 'parent' || m.relation === 'self');
            parents.forEach(parent => {
                drawConnection(svg, member, parent, containerRect);
            });
        }
        
        if (member.relation === 'spouse' || member.relation === 'self') {
            const spouse = members.find(m => 
                (m.relation === 'spouse' && member.relation === 'self') ||
                (m.relation === 'self' && member.relation === 'spouse')
            );
            if (spouse) {
                drawConnection(svg, member, spouse, containerRect, 'spouse');
            }
        }
    });
    
    container.appendChild(svg);
}

function drawConnection(svg, member1, member2, containerRect, type = 'family') {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    
    line.setAttribute('x1', `${member1.x}%`);
    line.setAttribute('y1', `${member1.y}%`);
    line.setAttribute('x2', `${member2.x}%`);
    line.setAttribute('y2', `${member2.y}%`);
    line.setAttribute('stroke', type === 'spouse' ? '#e74c3c' : '#667eea');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', type === 'spouse' ? '5,5' : 'none');
    
    svg.appendChild(line);
}

function formatRelation(relation) {
    const relationMap = {
        'self': 'Self',
        'parent': 'Parent',
        'spouse': 'Spouse',
        'child': 'Child',
        'sibling': 'Sibling',
        'grandparent': 'Grandparent',
        'grandchild': 'Grandchild'
    };
    
    return relationMap[relation] || relation;
}

function updateFamilyMemberPosition(memberId, x, y) {
    const familyMembers = loadFromStorage('familyMembers') || [];
    const memberIndex = familyMembers.findIndex(m => m.id === memberId);
    
    if (memberIndex !== -1) {
        familyMembers[memberIndex].x = x;
        familyMembers[memberIndex].y = y;
        saveToStorage('familyMembers', familyMembers);
    }
}

function editFamilyMember(memberId) {
    const familyMembers = loadFromStorage('familyMembers') || [];
    const member = familyMembers.find(m => m.id === memberId);
    
    if (!member) return;
    
    // Populate form with existing data
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-relation').value = member.relation;
    document.getElementById('member-birth-year').value = member.birthYear || '';
    
    // Change form to edit mode
    const form = document.getElementById('family-member-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Member';
    
    form.onsubmit = function(e) {
        e.preventDefault();
        updateFamilyMember(memberId);
    };
    
    showModal('family-member-modal');
}

function updateFamilyMember(memberId) {
    const name = document.getElementById('member-name').value.trim();
    const relation = document.getElementById('member-relation').value;
    const birthYear = document.getElementById('member-birth-year').value;

    if (!name || !relation) {
        showError('Please fill in all required fields');
        return;
    }

    const familyMembers = loadFromStorage('familyMembers') || [];
    const memberIndex = familyMembers.findIndex(m => m.id === memberId);
    
    if (memberIndex !== -1) {
        familyMembers[memberIndex].name = name;
        familyMembers[memberIndex].relation = relation;
        familyMembers[memberIndex].birthYear = birthYear ? parseInt(birthYear) : null;
        
        saveToStorage('familyMembers', familyMembers);
        
        // Reset form
        const form = document.getElementById('family-member-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add Member';
        form.onsubmit = function(e) {
            e.preventDefault();
            addFamilyMember();
        };
        
        closeModal(document.getElementById('family-member-modal'));
        renderFamilyTree();
        showSuccess(`${name} has been updated`);
    }
}

function deleteFamilyMember(memberId) {
    const familyMembers = loadFromStorage('familyMembers') || [];
    const member = familyMembers.find(m => m.id === memberId);
    
    if (!member) return;
    
    if (confirm(`Are you sure you want to remove ${member.name} from the family tree?`)) {
        const updatedMembers = familyMembers.filter(m => m.id !== memberId);
        saveToStorage('familyMembers', updatedMembers);
        renderFamilyTree();
        showSuccess(`${member.name} has been removed from the family tree`);
    }
}

// Add some CSS for the family tree specific elements
const familyTreeStyles = `
    .family-member {
        min-width: 120px;
        max-width: 150px;
        background: white;
        border: 2px solid #667eea;
        border-radius: 15px;
        padding: 1rem;
        text-align: center;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        transition: all 0.3s ease;
        cursor: pointer;
        user-select: none;
    }
    
    .family-member:hover {
        transform: translate(-50%, -50%) scale(1.05);
        box-shadow: 0 6px 25px rgba(102, 126, 234, 0.3);
    }
    
    .member-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 0.5rem;
        color: white;
        font-size: 1.5rem;
    }
    
    .family-member h4 {
        margin: 0.5rem 0;
        color: #333;
        font-size: 0.9rem;
    }
    
    .family-member p {
        margin: 0;
        color: #666;
        font-size: 0.8rem;
    }
    
    .member-actions {
        margin-top: 0.5rem;
        display: flex;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .btn-edit, .btn-delete {
        background: none;
        border: none;
        padding: 0.3rem;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .btn-edit {
        color: #667eea;
    }
    
    .btn-edit:hover {
        background: #667eea;
        color: white;
    }
    
    .btn-delete {
        color: #e74c3c;
    }
    
    .btn-delete:hover {
        background: #e74c3c;
        color: white;
    }
    
    .empty-state {
        text-align: center;
        color: #666;
        padding: 3rem;
    }
    
    .empty-state h3 {
        margin: 1rem 0;
        color: #333;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = familyTreeStyles;
document.head.appendChild(styleSheet);