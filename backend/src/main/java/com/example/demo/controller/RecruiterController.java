package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.EmployabilityScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recruiter")
@CrossOrigin(originPatterns = "*")
public class RecruiterController {

    @Autowired private StudentRepository studentRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private CertificationRepository certRepo;
    @Autowired private EmployabilityScoreService scoreService;

    // 1. Recruiter candidate talent search
    @GetMapping("/students")
    public ResponseEntity<?> searchCandidates(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) Integer minScore,
            @RequestParam(required = false) String readiness,
            @RequestParam(required = false) Boolean hasInternship,
            @RequestParam(required = false) Boolean hasCertification,
            @RequestParam(required = false) String department
    ) {
        List<Student> all = studentRepo.findAll();

        List<Map<String, Object>> candidates = all.stream().filter(s -> {
            // Only active accounts
            if (s.getUser() != null && Boolean.FALSE.equals(s.getUser().getIsActive())) {
                return false;
            }

            // Keyword search
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase().trim();
                String fullName = ((s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "")).toLowerCase();
                String dept = s.getDepartment() != null ? s.getDepartment().toLowerCase() : "";
                if (!fullName.contains(q) && !dept.contains(q)) {
                    return false;
                }
            }

            // Department filter
            if (department != null && !department.isBlank() && !department.equalsIgnoreCase("All")) {
                if (s.getDepartment() == null || !s.getDepartment().equalsIgnoreCase(department)) {
                    return false;
                }
            }

            // Min score filter
            int score = s.getEmployabilityScore() != null ? s.getEmployabilityScore() : 0;
            if (minScore != null && score < minScore) return false;

            // Readiness filter
            if (readiness != null && !readiness.isBlank() && !readiness.equalsIgnoreCase("All")) {
                if (s.getReadinessLevel() == null || !s.getReadinessLevel().equalsIgnoreCase(readiness)) {
                    return false;
                }
            }

            Long sid = s.getUserId();

            // Skill filter
            if (skill != null && !skill.isBlank() && !skill.equalsIgnoreCase("All")) {
                List<Skill> studentSkills = skillRepo.findByStudentId(sid);
                boolean hasMatch = studentSkills.stream().anyMatch(sk -> sk.getName() != null && sk.getName().toLowerCase().contains(skill.toLowerCase()));
                if (!hasMatch) return false;
            }

            // Internship filter
            if (hasInternship != null && hasInternship) {
                if (internshipRepo.findByStudentId(sid).isEmpty()) return false;
            }

            // Certification filter
            if (hasCertification != null && hasCertification) {
                if (certRepo.findByStudentId(sid).isEmpty()) return false;
            }

            return true;
        }).map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("studentId", s.getUserId());
            map.put("firstName", s.getFirstName());
            map.put("lastName", s.getLastName());
            map.put("department", s.getDepartment());
            map.put("degree", s.getDegree());
            map.put("batch", s.getBatch());
            map.put("cgpa", s.getCgpa());
            map.put("employabilityScore", s.getEmployabilityScore() != null ? s.getEmployabilityScore() : 0);
            map.put("readinessLevel", s.getReadinessLevel() != null ? s.getReadinessLevel() : "Needs Development");
            map.put("githubUrl", s.getGithubUrl());
            map.put("linkedinUrl", s.getLinkedinUrl());
            map.put("portfolioUrl", s.getPortfolioUrl());
            map.put("skills", skillRepo.findByStudentId(s.getUserId()));
            map.put("projectsCount", projectRepo.findByStudentId(s.getUserId()).size());
            map.put("internshipsCount", internshipRepo.findByStudentId(s.getUserId()).size());
            map.put("certificationsCount", certRepo.findByStudentId(s.getUserId()).size());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(candidates);
    }

    // 2. View specific candidate profile
    @GetMapping("/students/{id}")
    public ResponseEntity<?> getCandidateProfile(@PathVariable Long id) {
        Optional<Student> studentOpt = studentRepo.findById(id);
        if (studentOpt.isEmpty()) return ResponseEntity.notFound().build();

        Student s = studentOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("studentId", s.getUserId());
        profile.put("firstName", s.getFirstName());
        profile.put("lastName", s.getLastName());
        profile.put("department", s.getDepartment());
        profile.put("degree", s.getDegree());
        profile.put("batch", s.getBatch());
        profile.put("cgpa", s.getCgpa());
        profile.put("employabilityScore", s.getEmployabilityScore() != null ? s.getEmployabilityScore() : 0);
        profile.put("readinessLevel", s.getReadinessLevel() != null ? s.getReadinessLevel() : "Needs Development");
        profile.put("githubUrl", s.getGithubUrl());
        profile.put("linkedinUrl", s.getLinkedinUrl());
        profile.put("portfolioUrl", s.getPortfolioUrl());

        profile.put("skills", skillRepo.findByStudentId(id));
        profile.put("projects", projectRepo.findByStudentId(id));
        profile.put("internships", internshipRepo.findByStudentId(id));
        profile.put("certifications", certRepo.findByStudentId(id));
        profile.put("scoreBreakdown", scoreService.getScoreBreakdown(id));

        return ResponseEntity.ok(profile);
    }
}
