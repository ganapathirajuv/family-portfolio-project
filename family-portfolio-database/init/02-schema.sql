-- ================================================================
-- FAMILY PORTFOLIO DATABASE - DDL & DML SCRIPTS
-- PostgreSQL 15+ Compatible
-- ================================================================

-- ================================================================
-- 1. DATABASE SETUP
-- ================================================================

-- Create database (run as superuser)
-- CREATE DATABASE family_portfolio;
-- CREATE USER portfolio_admin WITH PASSWORD 'secure_password_123';
-- GRANT ALL PRIVILEGES ON DATABASE family_portfolio TO portfolio_admin;

-- ================================================================
-- 2. DDL (Data Definition Language) - TABLE CREATION
-- ================================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and authorization
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Family members table - core entity for family tree
CREATE TABLE family_members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    maiden_name VARCHAR(100),
    birth_date DATE,
    death_date DATE,
    birth_location VARCHAR(255),
    death_location VARCHAR(255),
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'unknown')),
    biography TEXT,
    occupation VARCHAR(255),
    education VARCHAR(255),
    profile_photo_id INTEGER,
    privacy_level VARCHAR(20) DEFAULT 'family' CHECK (privacy_level IN ('public', 'family', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relationships table for family connections
CREATE TABLE relationships (
    id SERIAL PRIMARY KEY,
    person1_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    person2_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN (
        'parent_child', 'spouse', 'sibling', 'grandparent_grandchild', 
        'uncle_aunt_nephew_niece', 'cousin', 'other'
    )),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_relationship UNIQUE (person1_id, person2_id, relationship_type)
);

-- Photos table for family photo management
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    original_filename VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    photo_date DATE,
    location VARCHAR(255),
    event_type VARCHAR(100),
    photographer VARCHAR(100),
    privacy_level VARCHAR(20) DEFAULT 'family' CHECK (privacy_level IN ('public', 'family', 'private')),
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents table for family document storage
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(100) CHECK (document_type IN (
        'birth_certificate', 'death_certificate', 'marriage_certificate', 
        'passport', 'immigration', 'military', 'academic', 'legal', 'other'
    )),
    file_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    document_date DATE,
    location VARCHAR(255),
    issuing_authority VARCHAR(255),
    privacy_level VARCHAR(20) DEFAULT 'family' CHECK (privacy_level IN ('public', 'family', 'private')),
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for photos and people (many-to-many relationship)
CREATE TABLE photo_people (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    x_coordinate DECIMAL(5,2),
    y_coordinate DECIMAL(5,2),
    width DECIMAL(5,2),
    height DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_photo_person UNIQUE (photo_id, person_id)
);

-- Junction table for documents and people (many-to-many relationship)
CREATE TABLE document_people (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_document_person UNIQUE (document_id, person_id)
);

-- Events table for family events and milestones
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) CHECK (event_type IN (
        'birth', 'death', 'marriage', 'divorce', 'graduation', 
        'military_service', 'immigration', 'reunion', 'anniversary', 'other'
    )),
    event_date DATE,
    location VARCHAR(255),
    privacy_level VARCHAR(20) DEFAULT 'family' CHECK (privacy_level IN ('public', 'family', 'private')),
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for events and people (many-to-many relationship)
CREATE TABLE event_people (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    role VARCHAR(100), -- e.g., 'bride', 'groom', 'deceased', 'graduate', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_event_person UNIQUE (event_id, person_id)
);

-- ================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ================================================================

-- Family members indexes
CREATE INDEX idx_family_members_name ON family_members(first_name, last_name);
CREATE INDEX idx_family_members_birth_date ON family_members(birth_date);
CREATE INDEX idx_family_members_death_date ON family_members(death_date);
CREATE INDEX idx_family_members_gender ON family_members(gender);
CREATE INDEX idx_family_members_privacy ON family_members(privacy_level);

-- Relationships indexes
CREATE INDEX idx_relationships_person1 ON relationships(person1_id);
CREATE INDEX idx_relationships_person2 ON relationships(person2_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
CREATE INDEX idx_relationships_persons ON relationships(person1_id, person2_id);

-- Photos indexes
CREATE INDEX idx_photos_date ON photos(photo_date);
CREATE INDEX idx_photos_location ON photos(location);
CREATE INDEX idx_photos_event_type ON photos(event_type);
CREATE INDEX idx_photos_privacy ON photos(privacy_level);
CREATE INDEX idx_photos_tags ON photos USING GIN(tags);

-- Documents indexes
CREATE INDEX idx_documents_date ON documents(document_date);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_privacy ON documents(privacy_level);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);

-- Events indexes
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_privacy ON events(privacy_level);

-- ================================================================
-- 4. TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 5. DML (Data Manipulation Language) - SAMPLE DATA
-- ================================================================

-- Insert default admin user
INSERT INTO users (email, username, full_name, hashed_password, role, is_active, is_verified)
VALUES (
    'admin@familyportfolio.com',
    'admin',
    'Portfolio Administrator',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbYbpzkY9ZLTt.e', -- "admin123"
    'admin',
    TRUE,
    TRUE
);

-- Insert sample family members
INSERT INTO family_members (first_name, last_name, birth_date, birth_location, gender, biography, occupation) VALUES
('John', 'Smith', '1950-03-15', 'New York, NY', 'male', 'Patriarch of the Smith family. Worked as an engineer for 40 years.', 'Engineer'),
('Mary', 'Smith', '1952-07-22', 'Boston, MA', 'female', 'Loving mother and teacher. Dedicated her life to education.', 'Teacher'),
('Robert', 'Smith', '1975-11-08', 'Chicago, IL', 'male', 'First son of John and Mary. Software developer and family tech enthusiast.', 'Software Developer'),
('Susan', 'Johnson', '1978-04-12', 'Denver, CO', 'female', 'Roberts wife. Works as a nurse and loves photography.', 'Nurse'),
('Emily', 'Smith', '2005-09-30', 'Seattle, WA', 'female', 'Daughter of Robert and Susan. High school student with interests in art.', 'Student'),
('Michael', 'Smith', '2008-01-18', 'Seattle, WA', 'male', 'Son of Robert and Susan. Loves sports and video games.', 'Student');

-- Insert family relationships
INSERT INTO relationships (person1_id, person2_id, relationship_type, start_date, notes) VALUES
-- John and Mary as spouses
(1, 2, 'spouse', '1972-06-15', 'Married in a beautiful ceremony in Boston'),
-- Parent-child relationships
(1, 3, 'parent_child', '1975-11-08', 'Father to son'),
(2, 3, 'parent_child', '1975-11-08', 'Mother to son'),
-- Robert and Susan as spouses
(3, 4, 'spouse', '2003-08-20', 'Met in college, married after 5 years of dating'),
-- Robert and Susan as parents to Emily and Michael
(3, 5, 'parent_child', '2005-09-30', 'Father to daughter'),
(4, 5, 'parent_child', '2005-09-30', 'Mother to daughter'),
(3, 6, 'parent_child', '2008-01-18', 'Father to son'),
(4, 6, 'parent_child', '2008-01-18', 'Mother to son'),
-- Sibling relationships
(5, 6, 'sibling', '2008-01-18', 'Sister and brother'),
-- Grandparent relationships
(1, 5, 'grandparent_grandchild', '2005-09-30', 'Grandfather to granddaughter'),
(2, 5, 'grandparent_grandchild', '2005-09-30', 'Grandmother to granddaughter'),
(1, 6, 'grandparent_grandchild', '2008-01-18', 'Grandfather to grandson'),
(2, 6, 'grandparent_grandchild', '2008-01-18', 'Grandmother to grandson');

-- Insert sample events
INSERT INTO events (title, description, event_type, event_date, location) VALUES
('John and Mary Wedding', 'Beautiful wedding ceremony with family and friends', 'marriage', '1972-06-15', 'Boston, MA'),
('Robert Birth', 'First child born to John and Mary', 'birth', '1975-11-08', 'Chicago, IL'),
('Robert and Susan Wedding', 'Outdoor wedding ceremony in the mountains', 'marriage', '2003-08-20', 'Denver, CO'),
('Emily Birth', 'First daughter born to Robert and Susan', 'birth', '2005-09-30', 'Seattle, WA'),
('Michael Birth', 'Son born to Robert and Susan', 'birth', '2008-01-18', 'Seattle, WA'),
('Smith Family Reunion 2023', 'Annual family gathering with all relatives', 'reunion', '2023-07-15', 'Seattle, WA');

-- Link people to events
INSERT INTO event_people (event_id, person_id, role) VALUES
-- John and Mary wedding
(1, 1, 'groom'),
(1, 2, 'bride'),
-- Robert birth
(2, 3, 'child'),
(2, 1, 'father'),
(2, 2, 'mother'),
-- Robert and Susan wedding
(3, 3, 'groom'),
(3, 4, 'bride'),
-- Emily birth
(4, 5, 'child'),
(4, 3, 'father'),
(4, 4, 'mother'),
-- Michael birth
(5, 6, 'child'),
(5, 3, 'father'),
(5, 4, 'mother'),
-- Family reunion - all family members
(6, 1, 'attendee'),
(6, 2, 'attendee'),
(6, 3, 'attendee'),
(6, 4, 'attendee'),
(6, 5, 'attendee'),
(6, 6, 'attendee');

-- ================================================================
-- 6. USEFUL VIEWS FOR COMMON QUERIES
-- ================================================================

-- View for family tree with full names and relationships
CREATE VIEW family_tree_view AS
SELECT 
    fm1.id as person1_id,
    CONCAT(fm1.first_name, ' ', fm1.last_name) as person1_name,
    fm2.id as person2_id,
    CONCAT(fm2.first_name, ' ', fm2.last_name) as person2_name,
    r.relationship_type,
    r.start_date,
    r.end_date,
    r.notes
FROM relationships r
JOIN family_members fm1 ON r.person1_id = fm1.id
JOIN family_members fm2 ON r.person2_id = fm2.id;

-- View for living family members
CREATE VIEW living_members AS
SELECT 
    id,
    CONCAT(first_name, ' ', COALESCE(last_name, '')) as full_name,
    birth_date,
    birth_location,
    gender,
    occupation,
    EXTRACT(YEAR FROM AGE(birth_date)) as age
FROM family_members
WHERE death_date IS NULL;

-- View for events with participant count
CREATE VIEW events_summary AS
SELECT 
    e.id,
    e.title,
    e.event_type,
    e.event_date,
    e.location,
    COUNT(ep.person_id) as participant_count
FROM events e
LEFT JOIN event_people ep ON e.id = ep.event_id
GROUP BY e.id, e.title, e.event_type, e.event_date, e.location;

-- ================================================================
-- 7. SECURITY FUNCTIONS
-- ================================================================

-- Create read-only user for analytics
-- CREATE USER analytics_user WITH PASSWORD 'analytics_secure_password';
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO analytics_user;

-- ================================================================
-- 8. MAINTENANCE QUERIES
-- ================================================================

-- Query to find orphaned relationships (references non-existent people)
-- SELECT * FROM relationships r
-- WHERE NOT EXISTS (SELECT 1 FROM family_members fm WHERE fm.id = r.person1_id)
--    OR NOT EXISTS (SELECT 1 FROM family_members fm WHERE fm.id = r.person2_id);

-- Query to find people without any relationships
-- SELECT fm.* FROM family_members fm
-- WHERE NOT EXISTS (
--     SELECT 1 FROM relationships r 
--     WHERE r.person1_id = fm.id OR r.person2_id = fm.id
-- );

-- Query to get family statistics
-- SELECT 
--     COUNT(*) as total_people,
--     COUNT(CASE WHEN death_date IS NULL THEN 1 END) as living_people,
--     COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_count,
--     COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_count,
--     AVG(EXTRACT(YEAR FROM AGE(COALESCE(death_date, CURRENT_DATE), birth_date))) as avg_age
-- FROM family_members
-- WHERE birth_date IS NOT NULL;

-- ================================================================
-- END OF SCRIPT
-- ================================================================