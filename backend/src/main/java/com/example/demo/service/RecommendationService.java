package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecommendationService {

    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private CertificationRepository certRepo;
    @Autowired private HackathonRepository hackathonRepo;
    @Autowired private StudentRepository studentRepo;

    public List<Map<String, Object>> generateRecommendations(Long studentId) {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        Student student = studentRepo.findById(studentId).orElse(null);
        if (student == null) return recommendations;

        List<Skill> skills = skillRepo.findByStudentId(studentId);
        List<Project> projects = projectRepo.findByStudentId(studentId);
        List<Internship> internships = internshipRepo.findByStudentId(studentId);
        List<Certification> certs = certRepo.findByStudentId(studentId);
        List<Hackathon> hackathons = hackathonRepo.findByStudentId(studentId);

        // 1. Skill recommendations
        if (skills.size() < 3) {
            recommendations.add(createRecommendation(
                    "Skills",
                    "Add More Technical Skills",
                    "You currently have only " + skills.size() + " skill(s) listed. Add at least 5 in-demand industry skills (e.g. Java, Spring Boot, React, SQL, Cloud) to boost your readiness.",
                    "HIGH",
                    "skills"
            ));
        } else if (skills.size() < 5) {
            recommendations.add(createRecommendation(
                    "Skills",
                    "Expand Your Skill Portfolio",
                    "You have " + skills.size() + " skills. Reaching 5+ verified skills with Advanced or Expert proficiency maximizes your skills score (25%).",
                    "MEDIUM",
                    "skills"
            ));
        }

        // 2. Project recommendations
        if (projects.isEmpty()) {
            recommendations.add(createRecommendation(
                    "Projects",
                    "Build Practical Projects",
                    "No projects added yet! Employers strongly value real-world applications. Build and showcase at least 2 full-stack or domain-specific projects with GitHub links.",
                    "HIGH",
                    "projects"
            ));
        } else if (projects.size() < 3) {
            recommendations.add(createRecommendation(
                    "Projects",
                    "Add More Comprehensive Projects",
                    "You have " + projects.size() + " project(s). Adding up to 4 production-grade projects with live demo links and GitHub repositories will maximize your project rating.",
                    "MEDIUM",
                    "projects"
            ));
        }

        // 3. Internship recommendations
        if (internships.isEmpty()) {
            recommendations.add(createRecommendation(
                    "Internships",
                    "Gain Real-World Internship Experience",
                    "Zero internships recorded. Internships account for 20% of your total employability score. Prioritize finding a summer or semester internship.",
                    "HIGH",
                    "internships"
            ));
        } else if (internships.size() < 2) {
            recommendations.add(createRecommendation(
                    "Internships",
                    "Explore Secondary Industry Engagements",
                    "Having 2 internships maximizes your internship score component (20 points). Consider remote apprenticeships or contract projects.",
                    "LOW",
                    "internships"
            ));
        }

        // 4. Certification recommendations
        if (certs.isEmpty()) {
            recommendations.add(createRecommendation(
                    "Certifications",
                    "Obtain Industry-Recognized Certifications",
                    "Certifications validate your foundational knowledge. Consider pursuing recognized certificates in AWS, Java, Oracle, or Azure to stand out to recruiters.",
                    "MEDIUM",
                    "certifications"
            ));
        }

        // 5. Hackathons recommendations
        if (hackathons.isEmpty()) {
            recommendations.add(createRecommendation(
                    "Hackathons",
                    "Participate in Coding Competitions",
                    "Competitive coding and hackathons demonstrate problem-solving under pressure and teamwork. Join college or online hackathons.",
                    "LOW",
                    "hackathons"
            ));
        }

        // 6. Academic recommendations
        Double cgpa = student.getCgpa();
        if (cgpa == null || cgpa < 7.0) {
            recommendations.add(createRecommendation(
                    "Academics",
                    "Focus on Academic Performance",
                    "Your current CGPA is " + (cgpa != null ? cgpa : "unspecified") + ". Aim for a CGPA of 7.5+ to clear corporate placement eligibility cutoffs.",
                    "HIGH",
                    "academics"
            ));
        }

        // 7. General positive reinforcement if ready
        if (student.getEmployabilityScore() != null && student.getEmployabilityScore() >= 75) {
            recommendations.add(createRecommendation(
                    "Career",
                    "Prepare for Campus Interviews",
                    "Excellent progress! Your score places you in the " + student.getReadinessLevel() + " tier. Practice behavioral mock interviews and system design questions.",
                    "LOW",
                    "dashboard"
            ));
        }

        return recommendations;
    }

    private Map<String, Object> createRecommendation(String category, String title, String message, String priority, String actionTab) {
        Map<String, Object> rec = new HashMap<>();
        rec.put("category", category);
        rec.put("title", title);
        rec.put("message", message);
        rec.put("priority", priority);
        rec.put("actionTab", actionTab);
        return rec;
    }
}
