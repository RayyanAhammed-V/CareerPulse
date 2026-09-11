-- Database managed by Aiven (defaultdb)

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Base Users table for Authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'FACULTY', 'RECRUITER', 'ADMIN') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students
CREATE TABLE IF NOT EXISTS students (
    user_id INT PRIMARY KEY,
    register_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
    address TEXT,
    college VARCHAR(255),
    university VARCHAR(255),
    department_id INT,
    semester INT,
    cgpa DECIMAL(4,2),
    backlogs INT DEFAULT 0,
    graduation_year INT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    career_interest VARCHAR(255),
    preferred_job_role VARCHAR(255),
    about_me TEXT,
    employability_score INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Faculty
CREATE TABLE IF NOT EXISTS faculty (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department_id INT,
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Recruiters
CREATE TABLE IF NOT EXISTS recruiters (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admins
CREATE TABLE IF NOT EXISTS admins (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Skills Dictionary
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('Programming', 'Web', 'Database', 'Cloud', 'AI/ML', 'Cybersecurity', 'Design', 'Communication', 'Leadership', 'Other') NOT NULL
);

-- Student Skills
CREATE TABLE IF NOT EXISTS student_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    skill_id INT,
    proficiency ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
    experience_months INT DEFAULT 0,
    last_practiced DATE,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_skill (student_id, skill_id)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(100),
    technologies TEXT,
    start_date DATE,
    end_date DATE,
    team_size INT DEFAULT 1,
    student_role VARCHAR(100),
    github_url VARCHAR(255),
    demo_url VARCHAR(255),
    status ENUM('Planned', 'In Progress', 'Completed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(100),
    credential_url VARCHAR(255),
    proof_file_path VARCHAR(255),
    verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- Internships
CREATE TABLE IF NOT EXISTS internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    type ENUM('On-site', 'Remote', 'Hybrid') NOT NULL,
    start_date DATE,
    end_date DATE,
    duration_months INT,
    technologies TEXT,
    description TEXT,
    skills_gained TEXT,
    certificate_path VARCHAR(255),
    verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- Hackathons
CREATE TABLE IF NOT EXISTS hackathons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    name VARCHAR(255) NOT NULL,
    organizer VARCHAR(255),
    hackathon_date DATE,
    team_size INT DEFAULT 1,
    project_name VARCHAR(255),
    position VARCHAR(100),
    achievement ENUM('Participation', 'Finalist', 'Top 10', 'Runner-up', 'Winner') NOT NULL,
    certificate_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'ANNOUNCEMENT') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(user_id) ON DELETE SET NULL
);

-- Score History
CREATE TABLE IF NOT EXISTS score_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    previous_score INT DEFAULT 0,
    new_score INT NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- Scoring Rules
CREATE TABLE IF NOT EXISTS scoring_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL UNIQUE,
    weight_percentage DECIMAL(5,2) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Shortlists (Recruiter)
CREATE TABLE IF NOT EXISTS shortlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id INT,
    student_id INT,
    notes TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(user_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_shortlist (recruiter_id, student_id)
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
