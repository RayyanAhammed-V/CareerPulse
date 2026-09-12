package com.example.demo.service;

import com.example.demo.model.Student;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmployabilityScoreService {

    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private CertificationRepository certRepo;
    @Autowired private HackathonRepository hackathonRepo;
    @Autowired private StudentRepository studentRepo;

    public void calculateAndUpdateScore(Long studentId) {
        Student student = studentRepo.findById(studentId).orElse(null);
        if (student == null) return;

        int skillCount = skillRepo.findByStudentId(studentId).size();
        int projectCount = projectRepo.findByStudentId(studentId).size();
        int internshipCount = internshipRepo.findByStudentId(studentId).size();
        int certCount = certRepo.findByStudentId(studentId).size();
        int hackathonCount = hackathonRepo.findByStudentId(studentId).size();
        double cgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;

        // Skills: max 5 skills (25%) -> 5 points each
        double skillScore = Math.min(skillCount, 5) * 5.0;
        
        // Projects: max 4 projects (20%) -> 5 points each
        double projectScore = Math.min(projectCount, 4) * 5.0;
        
        // Internships: max 2 internships (20%) -> 10 points each
        double internshipScore = Math.min(internshipCount, 2) * 10.0;
        
        // Certifications: max 3 certs (15%) -> 5 points each
        double certScore = Math.min(certCount, 3) * 5.0;
        
        // Hackathons: max 2 hackathons (10%) -> 5 points each
        double hackathonScore = Math.min(hackathonCount, 2) * 5.0;
        
        // Academics: CGPA out of 10 (10%) -> cgpa directly
        double academicScore = Math.min(cgpa, 10.0);

        int totalScore = (int) Math.round(skillScore + projectScore + internshipScore + certScore + hackathonScore + academicScore);
        
        student.setEmployabilityScore(totalScore);
        studentRepo.save(student);
    }
}
