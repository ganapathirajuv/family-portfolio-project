# Family Portfolio Project

A comprehensive web-based family portfolio application for maintaining family trees, organizing documents, and showcasing family photos.

## Features

### 🌳 Interactive Family Tree
- Add, edit, and delete family members
- Visual relationship mapping with connecting lines
- Drag-and-drop positioning for family members
- Relationship categorization (Parent, Spouse, Child, Sibling, Grandparent, Grandchild)
- Age calculation based on birth year

### 📄 Document Management
- Drag & drop file upload interface
- Support for multiple file types (PDF, DOC, DOCX, TXT, Images)
- Automatic document categorization (Official, Photos, History, Medical, General)
- File preview for images
- Document metadata tracking (size, upload date, category)
- Search and filter capabilities

### 📸 Photo Gallery
- Interactive photo upload with drag & drop
- Category-based filtering (All Photos, Events, Portraits, Vacations)
- Full-screen photo viewer with navigation
- Photo metadata editing (title, category)
- Responsive grid layout
- Keyboard navigation support

### 🎨 User Interface
- Clean, modern responsive design
- Smooth animations and transitions
- Mobile-friendly interface
- Intuitive navigation between sections
- Modal-based interactions
- Success/error messaging system

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for best experience)

### Installation

1. Clone or download the repository
2. Open the project folder
3. For best experience, serve files through a local web server:

#### Using Python (if installed):
```bash
cd family-portfolio-project
python3 -m http.server 8000
```
Then open: http://localhost:8000

#### Using Node.js (if installed):
```bash
cd family-portfolio-project
npx serve .
```

#### Or simply open `index.html` in your browser
For basic functionality, you can directly open the `index.html` file in your web browser.

## File Structure

```
family-portfolio-project/
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # Main stylesheet
├── scripts/
│   ├── main.js             # Core application logic
│   ├── family-tree.js      # Family tree functionality
│   ├── documents.js        # Document management
│   └── photos.js           # Photo gallery features
└── README.md               # This file
```

## Usage

### Family Tree
1. Click "Family Tree" in the navigation
2. Use "Add Family Member" to add new family members
3. Fill in name, relationship, and birth year
4. Drag family members to reposition them
5. Use edit/delete buttons on each member for modifications

### Documents
1. Navigate to "Documents" section
2. Drag files into the upload area or click to browse
3. Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG
4. Files are automatically categorized
5. Use view/download/delete buttons to manage documents

### Photo Gallery
1. Go to "Photo Gallery" section
2. Upload photos using the upload area
3. Use filter buttons to view specific categories
4. Click photos to view in full screen
5. Edit photo titles and categories using the edit button

## Data Storage

The application uses browser localStorage to persist data between sessions. This means:
- Data is stored locally in your browser
- Data persists between browser sessions
- Data is specific to the browser and device
- No server or cloud storage required

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Sample Data

The application comes pre-loaded with sample data to demonstrate functionality:
- Sample family members (John Doe, Jane Doe, Mike Doe)
- Sample documents (Birth Certificate, Family History)
- Sample photos (Family Vacation, Wedding Anniversary)

## Contributing

This is a personal family portfolio project. Feel free to fork and customize for your own family needs.

## License

This project is open source and available under the MIT License.