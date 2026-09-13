package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmployabilityScoreService {

    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private CertificationRepository certRepo;
    @Autowired private HackathonRepository hackathonRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private ScoreHistoryRepository scoreHistoryRepo;

    public String calculateReadinessLevel(int score) {
        if (score >= 90) return "Highly Ready";
        if (score >= 75) return "Placement Ready";
        if (score >= 60) return "Nearly Ready";
        if (score >= 40) return "Developing";
        return "Needs Development";
    }

    @Transactional
    public Map<String, Object> calculateAndUpdateScore(Long studentId) {
        Student student = studentRepo.findById(studentId).orElse(null);
        if (student == null) return Map.of("error", "Student not found");

        Integer previousScore = student.getEmployabilityScore() != null ? student.getEmployabilityScore() : 0;

        List<Skill> skills = skillRepo.findByStudentId(studentId);
        List<Project> projects = projectRepo.findByStudentId(studentId);
        List<Internship> internships = internshipRepo.findByStudentId(studentId);
        List<Certification> certs = certRepo.findByStudentId(studentId);
        List<Hackathon> hackathons = hackathonRepo.findByStudentId(studentId);

        // 1. Skills: max 25% (up to 5 skills, weighted by proficiency)
        double skillScore = 0.0;
        int skillCount = 0;
        for (Skill s : skills) {
            if (skillCount >= 5) break;
            double pts = 4.0;
            if (s.getProficiency() != null) {
                switch (s.getProficiency().toLowerCase()) {
                    case "expert":
                    case "advanced": pts = 5.0; break;
                    case "intermediate": pts = 4.0; break;
                    case "beginner": pts = 3.0; break;
                    default: pts = 4.0; break;
                }
            }
            skillScore += pts;
            skillCount++;
        }
        skillScore = Math.min(25.0, skillScore);

        // 2. Projects: max 20% (up to 4 projects, 5 pts each)
        double projectScore = 0.0;
        int projectCount = 0;
        for (Project p : projects) {
            if (projectCount >= 4) break;
            double pts = 4.0;
            if (p.getGithubLink() != null && !p.getGithubLink().isBlank()) pts += 1.0;
            projectScore += pts;
            projectCount++;
        }
        projectScore = Math.min(20.0, projectScore);

        // 3. Internships: max 20% (up to 2 internships, 10 pts each)
        double internshipScore = Math.min(20.0, internships.size() * 10.0);

        // 4. Certifications: max 15% (up to 3 certifications, 5 pts each)
        double certScore = Math.min(15.0, certs.size() * 5.0);

        // 5. Hackathons: max 10% (up to 2 hackathons, 5 pts each)
        double hackathonScore = 0.0;
        int hackCount = 0;
        for (Hackathon h : hackathons) {
            if (hackCount >= 2) break;
            double pts = 4.0;
            if (h.getAchievement() != null && (h.getAchievement().toLowerCase().contains("winner") || h.getAchievement().toLowerCase().contains("runner") || h.getAchievement().toLowerCase().contains("finalist"))) {
                pts = 5.0;
            }
            hackathonScore += pts;
            hackCount++;
        }
        hackathonScore = Math.min(10.0, hackathonScore);

        // 6. Academics: max 10% (CGPA out of 10)
        double cgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
        int backlogs = student.getBacklogs() != null ? student.getBacklogs() : 0;
        double academicScore = Math.max(0.0, Math.min(10.0, cgpa) - (backlogs * 0.5));

        int totalScore = (int) Math.round(skillScore + projectScore + internshipScore + certScore + hackathonScore + academicScore);
        totalScore = Math.max(0, Math.min(100, totalScore));

        String readinessLevel = calculateReadinessLevel(totalScore);

        student.setEmployabilityScore(totalScore);
        student.setReadinessLevel(readinessLevel);
        studentRepo.save(student);

        // Record ScoreHistory if score changed or history empty
        ScoreHistory history = new ScoreHistory();
        history.setStudentId(studentId);
        history.setPreviousScore(previousScore);
        history.setCurrentScore(totalScore);
        history.setReadinessLevel(readinessLevel);
        history.setSkillsScore(skillScore);
        history.setProjectsScore(projectScore);
        history.setInternshipsScore(internshipScore);
        history.setCertificationsScore(certScore);
        history.setHackathonsScore(hackathonScore);
        history.setAcademicsScore(academicScore);
        history.setCreatedAt(LocalDateTime.now());
        scoreHistoryRepo.save(history);

        Map<String, Object> result = new HashMap<>();
        result.put("totalScore", totalScore);
        result.put("readinessLevel", readinessLevel);
        result.put("skillsScore", skillScore);
        result.put("maxSkillsScore", 25);
        result.put("projectsScore", projectScore);
        result.put("maxProjectsScore", 20);
        result.put("internshipsScore", internshipScore);
        result.put("maxInternshipsScore", 20);
        result.put("certificationsScore", certScore);
        result.put("maxCertificationsScore", 15);
        result.put("hackathonsScore", hackathonScore);
        result.put("maxHackathonsScore", 10);
        result.put("academicsScore", academicScore);
        result.put("maxAcademicsScore", 10);
        return result;
    }

    public Map<String, Object> getScoreBreakdown(Long studentId) {
        Student student = studentRepo.findById(studentId).orElse(null);
        if (student == null) return Map.of("error", "Student not found");

        List<Skill> skills = skillRepo.findByStudentId(studentId);
        List<Project> projects = projectRepo.findByStudentId(studentId);
        List<Internship> internships = internshipRepo.findByStudentId(studentId);
        List<Certification> certs = certRepo.findByStudentId(studentId);
        List<Hackathon> hackathons = hackathonRepo.findByStudentId(studentId);

        double skillScore = Math.min(25.0, skills.size() * 5.0);
        double projectScore = Math.min(20.0, projects.size() * 5.0);
        double internshipScore = Math.min(20.0, internships.size() * 10.0);
        double certScore = Math.min(15.0, certs.size() * 5.0);
        double hackathonScore = Math.min(10.0, hackathons.size() * 5.0);
        double cgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
        int backlogs = student.getBacklogs() != null ? student.getBacklogs() : 0;
        double academicScore = Math.max(0.0, Math.min(10.0, cgpa) - (backlogs * 0.5));

        int totalScore = student.getEmployabilityScore() != null ? student.getEmployabilityScore() : 0;
        String readiness = student.getReadinessLevel() != null ? student.getReadinessLevel() : calculateReadinessLevel(totalScore);

        Map<String, Object> result = new HashMap<>();
        result.put("totalScore", totalScore);
        result.put("readinessLevel", readiness);
        result.put("skillsScore", skillScore);
        result.put("maxSkillsScore", 25);
        result.put("projectsScore", projectScore);
        result.put("maxProjectsScore", 20);
        result.put("internshipsScore", internshipScore);
        result.put("maxInternshipsScore", 20);
        result.put("certificationsScore", certScore);
        result.put("maxCertificationsScore", 15);
        result.put("hackathonsScore", hackathonScore);
        result.put("maxHackathonsScore", 10);
        result.put("academicsScore", academicScore);
        result.put("maxAcademicsScore", 10);
        return result;
    }
}
