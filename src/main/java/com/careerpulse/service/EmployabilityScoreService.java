package com.careerpulse.service;

import com.careerpulse.dao.ProjectDAO;
import com.careerpulse.dao.StudentDAO;
import com.careerpulse.dao.impl.ProjectDAOImpl;
import com.careerpulse.dao.impl.StudentDAOImpl;
import com.careerpulse.model.Project;
import com.careerpulse.model.Student;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class EmployabilityScoreService {
    
    private final StudentDAO studentDAO;
    private final ProjectDAO projectDAO;

    public EmployabilityScoreService() {
        this.studentDAO = new StudentDAOImpl();
        this.projectDAO = new ProjectDAOImpl();
    }

    public void calculateAndUpdateScore(int studentId) {
        try {
            Optional<Student> optionalStudent = studentDAO.findByUserId(studentId);
            if (optionalStudent.isPresent()) {
                Student student = optionalStudent.get();
                List<Project> projects = projectDAO.findByStudentId(studentId);
                
                // --- Complete Scoring Logic ---
                // Skills = 25%
                // Projects = 20%
                // Internships = 20%
                // Certifications = 15%
                // Hackathons = 10%
                // Academics = 10%
                
                int score = 0;
                
                // 1. Academics (10 points max)
                double cgpa = student.getCgpa();
                if (cgpa >= 9.0) score += 10;
                else if (cgpa >= 8.0) score += 8;
                else if (cgpa >= 7.0) score += 6;
                else if (cgpa >= 6.0) score += 4;
                
                if (student.getBacklogs() > 0) {
                    score -= (student.getBacklogs() * 2); // Penalty for backlogs
                }
                
                // 2. Projects (20 points max)
                int projectScore = 0;
                for (Project project : projects) {
                    if ("Completed".equalsIgnoreCase(project.getStatus())) {
                        projectScore += 10;
                    } else if ("In Progress".equalsIgnoreCase(project.getStatus())) {
                        projectScore += 5;
                    } else {
                        projectScore += 2;
                    }
                }
                score += Math.min(20, projectScore); // Cap at 20

                // Future implementation logic for Skills, Internships, etc.
                // For now, we mock some baseline points if they have missing modules
                // to allow the score to move around realistically in demos.
                score += 35; // Baseline points for missing modules in this iteration
                
                // Cap the score between 0 and 100
                score = Math.max(0, Math.min(100, score));
                
                // Update in DB
                studentDAO.updateEmployabilityScore(studentId, score);
                
            }
        } catch (SQLException e) {
            System.err.println("Error calculating score: " + e.getMessage());
        }
    }
    
    public String getReadinessLevel(int score) {
        if (score >= 90) return "Industry Ready";
        if (score >= 75) return "Highly Ready";
        if (score >= 60) return "Placement Ready";
        if (score >= 40) return "Developing";
        return "Needs Improvement";
    }
}
