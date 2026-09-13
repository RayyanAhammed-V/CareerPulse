package com.example.demo.config;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.EmployabilityScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private CertificationRepository certRepo;
    @Autowired private HackathonRepository hackathonRepo;
    @Autowired private EmployabilityScoreService scoreService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuditLogRepository auditLogRepo;

    @Override
    public void run(String... args) throws Exception {
        // Initialize default Admin if not present
        if (userRepo.findByEmail("admin@careernavigator.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@careernavigator.com");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setRole("ROLE_ADMIN");
            admin.setIsActive(true);
            admin.setPasswordResetRequired(false);
            userRepo.save(admin);

            auditLogRepo.save(new AuditLog("SYSTEM", "USER_CREATED", "admin@careernavigator.com", "Default administrator account initialized"));
        }

        // Initialize sample Faculty if not present
        if (userRepo.findByEmail("faculty@careernavigator.com").isEmpty()) {
            User faculty = new User();
            faculty.setEmail("faculty@careernavigator.com");
            faculty.setPasswordHash(passwordEncoder.encode("Faculty@123"));
            faculty.setRole("ROLE_FACULTY");
            faculty.setIsActive(true);
            faculty.setPasswordResetRequired(false);
            userRepo.save(faculty);
        }

        // Initialize sample Recruiter if not present
        if (userRepo.findByEmail("recruiter@careernavigator.com").isEmpty()) {
            User recruiter = new User();
            recruiter.setEmail("recruiter@careernavigator.com");
            recruiter.setPasswordHash(passwordEncoder.encode("Recruiter@123"));
            recruiter.setRole("ROLE_RECRUITER");
            recruiter.setIsActive(true);
            recruiter.setPasswordResetRequired(false);
            userRepo.save(recruiter);
        }

        // Initialize sample Student 1: John Doe
        if (userRepo.findByEmail("student@careernavigator.com").isEmpty()) {
            User u1 = new User();
            u1.setEmail("student@careernavigator.com");
            u1.setPasswordHash(passwordEncoder.encode("Student@123"));
            u1.setRole("ROLE_STUDENT");
            u1.setIsActive(true);
            u1.setPasswordResetRequired(false);
            u1 = userRepo.save(u1);

            Student s1 = new Student();
            s1.setUser(u1);
            s1.setFirstName("John");
            s1.setLastName("Doe");
            s1.setPhone("+1-555-0199");
            s1.setDepartment("Computer Science & Engineering");
            s1.setDegree("B.Tech");
            s1.setSemester(7);
            s1.setBatch(2025);
            s1.setAcademicYear("2024-2025");
            s1.setCgpa(8.6);
            s1.setBacklogs(0);
            s1.setGithubUrl("https://github.com/johndoe");
            s1.setLinkedinUrl("https://linkedin.com/in/johndoe");
            studentRepo.save(s1);

            skillRepo.save(new Skill(null, u1.getId(), "Java", "Technical", "Advanced"));
            skillRepo.save(new Skill(null, u1.getId(), "Spring Boot", "Framework", "Advanced"));
            skillRepo.save(new Skill(null, u1.getId(), "React", "Framework", "Intermediate"));
            skillRepo.save(new Skill(null, u1.getId(), "MySQL", "Database", "Intermediate"));
            skillRepo.save(new Skill(null, u1.getId(), "Problem Solving", "Soft Skill", "Expert"));

            projectRepo.save(new Project(null, u1.getId(), "Smart Campus Portal", "Microservices-based campus management platform.", "Java, Spring Boot, MySQL", "Full Stack Developer", "3 months", "https://campus.demo.com", "https://github.com/johndoe/campus-portal"));
            projectRepo.save(new Project(null, u1.getId(), "E-Commerce Microservices", "Scalable store with payment gateway and caching.", "Spring Cloud, Docker, Redis", "Backend Lead", "4 months", "", "https://github.com/johndoe/ecommerce-api"));

            internshipRepo.save(new Internship(null, u1.getId(), "TechCorp Solutions", "Software Engineering Intern", "2024-05-01", "2024-07-31", "Contributed to REST API design, query optimization, and test automation.", "Java, Spring, JUnit"));

            certRepo.save(new Certification(null, u1.getId(), "Oracle Certified Professional: Java SE 17 Developer", "Oracle", "2024-02-15", "2027-02-15", "OCP-J17-9921", "https://oracle.com/verify"));
            certRepo.save(new Certification(null, u1.getId(), "AWS Certified Cloud Practitioner", "Amazon Web Services", "2023-11-10", "2026-11-10", "AWS-CCP-4821", "https://aws.amazon.com/verification"));

            hackathonRepo.save(new Hackathon(null, u1.getId(), "Smart India Hackathon", "AICTE", "2023-12-20", "First Runner Up", 4, "Built IoT-assisted agricultural supply chain tracking app.", "https://sih.gov.in"));

            scoreService.calculateAndUpdateScore(u1.getId());
        }

        // Initialize sample Student 2: Sarah Connor (High readiness)
        if (userRepo.findByEmail("sarah@careernavigator.com").isEmpty()) {
            User u2 = new User();
            u2.setEmail("sarah@careernavigator.com");
            u2.setPasswordHash(passwordEncoder.encode("Student@123"));
            u2.setRole("ROLE_STUDENT");
            u2.setIsActive(true);
            u2.setPasswordResetRequired(false);
            u2 = userRepo.save(u2);

            Student s2 = new Student();
            s2.setUser(u2);
            s2.setFirstName("Sarah");
            s2.setLastName("Connor");
            s2.setPhone("+1-555-0245");
            s2.setDepartment("Information Technology");
            s2.setDegree("B.Tech");
            s2.setSemester(8);
            s2.setBatch(2025);
            s2.setAcademicYear("2024-2025");
            s2.setCgpa(9.2);
            s2.setBacklogs(0);
            s2.setGithubUrl("https://github.com/sarah-connor");
            s2.setLinkedinUrl("https://linkedin.com/in/sarah-connor");
            studentRepo.save(s2);

            skillRepo.save(new Skill(null, u2.getId(), "Java", "Technical", "Expert"));
            skillRepo.save(new Skill(null, u2.getId(), "Python", "Technical", "Advanced"));
            skillRepo.save(new Skill(null, u2.getId(), "Docker", "DevOps", "Advanced"));
            skillRepo.save(new Skill(null, u2.getId(), "Kubernetes", "DevOps", "Intermediate"));
            skillRepo.save(new Skill(null, u2.getId(), "Spring Boot", "Framework", "Expert"));

            projectRepo.save(new Project(null, u2.getId(), "Autonomous Cyber Defense Monitor", "Network packet inspector and anomaly detector.", "Java, Kafka, Spark", "Lead Architect", "6 months", "https://defense.demo.org", "https://github.com/sarah-connor/cyber-defense"));
            projectRepo.save(new Project(null, u2.getId(), "Distributed KV Store", "Raft consensus protocol implementation in Java.", "Java, Netty, Raft", "Author", "2 months", "", "https://github.com/sarah-connor/raft-kv"));
            projectRepo.save(new Project(null, u2.getId(), "Fintech Payment Router", "High-throughput transaction router with idempotent processing.", "Spring Boot, Postgres", "Backend Engineer", "3 months", "", "https://github.com/sarah-connor/pay-router"));
            projectRepo.save(new Project(null, u2.getId(), "Cloud Metric Collector", "Lightweight agent sending telemetry to Prometheus.", "Go, Java", "Developer", "1 month", "", "https://github.com/sarah-connor/cloud-collector"));

            internshipRepo.save(new Internship(null, u2.getId(), "Google Cloud", "Software Engineering Intern", "2024-05-15", "2024-08-15", "Worked on internal distributed tracing systems.", "Java, Go, Kubernetes"));
            internshipRepo.save(new Internship(null, u2.getId(), "Razorpay", "Backend Engineering Intern", "2023-12-01", "2024-02-28", "Designed high-concurrency payment webhook handlers.", "Java, Spring Boot, MySQL"));

            certRepo.save(new Certification(null, u2.getId(), "AWS Certified Solutions Architect", "AWS", "2024-01-10", "2027-01-10", "AWS-SA-9182", "https://aws.amazon.com/verification"));
            certRepo.save(new Certification(null, u2.getId(), "Certified Kubernetes Administrator (CKA)", "Linux Foundation", "2023-09-15", "2026-09-15", "CKA-2918", "https://cncf.io"));
            certRepo.save(new Certification(null, u2.getId(), "Oracle Certified Professional: Java 17", "Oracle", "2023-04-10", "2026-04-10", "OCP-4123", "https://oracle.com"));

            hackathonRepo.save(new Hackathon(null, u2.getId(), "ETH India 2023", "Devfolio", "2023-11-25", "Grand Winner", 3, "Smart contracts for verifiable credential attestations.", "https://ethindia.co"));
            hackathonRepo.save(new Hackathon(null, u2.getId(), "Microsoft Imagine Cup", "Microsoft", "2024-03-05", "National Finalist", 4, "Accessible AI educational assistant for rural classrooms.", "https://imaginecup.com"));

            scoreService.calculateAndUpdateScore(u2.getId());
        }
    }
}
