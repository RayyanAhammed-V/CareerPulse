-- Connected to defaultdb
-- Insert Departments
INSERT INTO departments (name) VALUES 
('Computer Science and Engineering'),
('Information Technology'),
('Electronics and Communication'),
('Electrical and Electronics'),
('Mechanical Engineering');

-- Insert Initial Scoring Rules
INSERT INTO scoring_rules (category, weight_percentage, description) VALUES
('Skills', 25.00, 'Weightage for technical and soft skills proficiency'),
('Projects', 20.00, 'Weightage for completed projects and complexity'),
('Internships', 20.00, 'Weightage for industry experience'),
('Certifications', 15.00, 'Weightage for verified professional certifications'),
('Hackathons', 10.00, 'Weightage for hackathon achievements'),
('Academics', 10.00, 'Weightage for CGPA and lack of backlogs');

-- Insert Skills Dictionary
INSERT INTO skills (name, category) VALUES
('Java', 'Programming'),
('Python', 'Programming'),
('C++', 'Programming'),
('JavaScript', 'Web'),
('React', 'Web'),
('HTML/CSS', 'Web'),
('MySQL', 'Database'),
('MongoDB', 'Database'),
('AWS', 'Cloud'),
('Machine Learning', 'AI/ML'),
('Network Security', 'Cybersecurity'),
('Public Speaking', 'Communication'),
('Team Management', 'Leadership');

-- Insert Demo Users
-- Note: password_hash here is SHA-256 for 'password' (5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8)

-- 1 Admin
INSERT INTO users (email, password_hash, role) VALUES 
('admin@careerpulse.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'ADMIN');
SET @admin_id = LAST_INSERT_ID();
INSERT INTO admins (user_id, first_name, last_name, phone) VALUES 
(@admin_id, 'System', 'Admin', '1234567890');

-- 2 Faculty
INSERT INTO users (email, password_hash, role) VALUES 
('faculty1@careerpulse.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'FACULTY'),
('faculty2@careerpulse.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'FACULTY');

INSERT INTO faculty (user_id, first_name, last_name, department_id) VALUES 
(2, 'John', 'Doe', 1),
(3, 'Jane', 'Smith', 2);

-- 2 Recruiters
INSERT INTO users (email, password_hash, role) VALUES 
('recruiter1@careerpulse.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'RECRUITER'),
('recruiter2@careerpulse.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'RECRUITER');

INSERT INTO recruiters (user_id, first_name, last_name, company_name) VALUES 
(4, 'Tech', 'Corp', 'TechCorp Inc.'),
(5, 'Global', 'Solutions', 'Global IT Solutions');

-- 2 Students (for basic testing, more can be added later)
INSERT INTO users (email, password_hash, role) VALUES 
('student1@careerpulse.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'STUDENT'),
('student2@careerpulse.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'STUDENT');

INSERT INTO students (user_id, register_number, first_name, last_name, department_id, semester, cgpa, employability_score) VALUES 
(6, 'REG001', 'Alice', 'Johnson', 1, 6, 8.5, 65),
(7, 'REG002', 'Bob', 'Williams', 2, 6, 7.2, 45);

-- Insert Sample Student Skills
INSERT INTO student_skills (student_id, skill_id, proficiency, experience_months) VALUES
(6, 1, 'Advanced', 24),
(6, 7, 'Intermediate', 12),
(7, 2, 'Beginner', 6);

-- Insert Sample Projects
INSERT INTO projects (student_id, title, status, project_type) VALUES
(6, 'E-Commerce Website', 'Completed', 'Web Application'),
(7, 'Chatbot', 'In Progress', 'AI');
