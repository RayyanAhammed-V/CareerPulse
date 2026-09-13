package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.EmployabilityScoreService;
import com.example.demo.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(originPatterns = "*")
public class FacultyController {

    @Autowired private StudentRepository studentRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private CertificationRepository certRepo;
    @Autowired private HackathonRepository hackathonRepo;
    @Autowired private EmployabilityScoreService scoreService;
    @Autowired private RecommendationService recommendationService;

    // 1. Get filtered students list
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer minScore,
            @RequestParam(required = false) Integer maxScore,
            @RequestParam(required = false) String readiness,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) Boolean hasInternship,
            @RequestParam(required = false) Boolean hasCertification,
            @RequestParam(required = false) Integer minProjects,
            @RequestParam(required = false) Double minCgpa
    ) {
        List<Student> all = studentRepo.findAll();

        List<Map<String, Object>> filtered = all.stream().filter(s -> {
            // Search text filter
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase().trim();
                String fullName = ((s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "")).toLowerCase();
                String email = s.getUser() != null && s.getUser().getEmail() != null ? s.getUser().getEmail().toLowerCase() : "";
                String dept = s.getDepartment() != null ? s.getDepartment().toLowerCase() : "";
                if (!fullName.contains(q) && !email.contains(q) && !dept.contains(q)) {
                    return false;
                }
            }

            // Department filter
            if (department != null && !department.isBlank() && !department.equalsIgnoreCase("All")) {
                if (s.getDepartment() == null || !s.getDepartment().equalsIgnoreCase(department)) {
                    return false;
                }
            }

            // Score range filter
            int score = s.getEmployabilityScore() != null ? s.getEmployabilityScore() : 0;
            if (minScore != null && score < minScore) return false;
            if (maxScore != null && score > maxScore) return false;

            // Readiness level filter
            if (readiness != null && !readiness.isBlank() && !readiness.equalsIgnoreCase("All")) {
                if (s.getReadinessLevel() == null || !s.getReadinessLevel().equalsIgnoreCase(readiness)) {
                    return false;
                }
            }

            // CGPA filter
            if (minCgpa != null) {
                if (s.getCgpa() == null || s.getCgpa() < minCgpa) return false;
            }

            Long sid = s.getUserId();

            // Skill filter
            if (skill != null && !skill.isBlank() && !skill.equalsIgnoreCase("All")) {
                List<Skill> studentSkills = skillRepo.findByStudentId(sid);
                boolean hasSkill = studentSkills.stream().anyMatch(sk -> sk.getName() != null && sk.getName().toLowerCase().contains(skill.toLowerCase()));
                if (!hasSkill) return false;
            }

            // Internship status filter
            if (hasInternship != null) {
                int count = internshipRepo.findByStudentId(sid).size();
                if (hasInternship && count == 0) return false;
                if (!hasInternship && count > 0) return false;
            }

            // Certification status filter
            if (hasCertification != null) {
                int count = certRepo.findByStudentId(sid).size();
                if (hasCertification && count == 0) return false;
                if (!hasCertification && count > 0) return false;
            }

            // Minimum projects filter
            if (minProjects != null) {
                int count = projectRepo.findByStudentId(sid).size();
                if (count < minProjects) return false;
            }

            return true;
        }).map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("student", s);
            map.put("skillsCount", skillRepo.findByStudentId(s.getUserId()).size());
            map.put("projectsCount", projectRepo.findByStudentId(s.getUserId()).size());
            map.put("internshipsCount", internshipRepo.findByStudentId(s.getUserId()).size());
            map.put("certificationsCount", certRepo.findByStudentId(s.getUserId()).size());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }

    // 2. Get detailed student profile (read-only for faculty)
    @GetMapping("/students/{id}")
    public ResponseEntity<?> getStudentDetails(@PathVariable Long id) {
        Optional<Student> studentOpt = studentRepo.findById(id);
        if (studentOpt.isEmpty()) return ResponseEntity.notFound().build();

        Student student = studentOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("student", student);
        response.put("skills", skillRepo.findByStudentId(id));
        response.put("projects", projectRepo.findByStudentId(id));
        response.put("internships", internshipRepo.findByStudentId(id));
        response.put("certifications", certRepo.findByStudentId(id));
        response.put("hackathons", hackathonRepo.findByStudentId(id));
        response.put("scoreBreakdown", scoreService.getScoreBreakdown(id));
        response.put("recommendations", recommendationService.generateRecommendations(id));
        return ResponseEntity.ok(response);
    }

    // 3. Faculty Analytics
    @GetMapping("/analytics")
    public ResponseEntity<?> getFacultyAnalytics() {
        List<Student> students = studentRepo.findAll();
        int total = students.size();

        double avgScore = total > 0 ? students.stream()
                .mapToInt(s -> s.getEmployabilityScore() != null ? s.getEmployabilityScore() : 0)
                .average().orElse(0.0) : 0.0;

        Map<String, Integer> readinessDist = new LinkedHashMap<>();
        readinessDist.put("Needs Development", 0);
        readinessDist.put("Developing", 0);
        readinessDist.put("Nearly Ready", 0);
        readinessDist.put("Placement Ready", 0);
        readinessDist.put("Highly Ready", 0);

        Map<String, List<Integer>> deptScores = new HashMap<>();
        int needingImprovement = 0;

        for (Student s : students) {
            String level = s.getReadinessLevel();
            if (level != null && readinessDist.containsKey(level)) {
                readinessDist.put(level, readinessDist.get(level) + 1);
            } else {
                readinessDist.put("Needs Development", readinessDist.get("Needs Development") + 1);
            }

            int score = s.getEmployabilityScore() != null ? s.getEmployabilityScore() : 0;
            if (score < 60) needingImprovement++;

            String dept = s.getDepartment() != null && !s.getDepartment().isBlank() ? s.getDepartment() : "General";
            deptScores.computeIfAbsent(dept, k -> new ArrayList<>()).add(score);
        }

        Map<String, Object> deptStats = new HashMap<>();
        for (Map.Entry<String, List<Integer>> entry : deptScores.entrySet()) {
            double deptAvg = entry.getValue().stream().mapToInt(Integer::intValue).average().orElse(0.0);
            deptStats.put(entry.getKey(), Map.of(
                    "count", entry.getValue().size(),
                    "averageScore", Math.round(deptAvg * 10.0) / 10.0
            ));
        }

        // Skill frequency analysis
        List<Skill> allSkills = skillRepo.findAll();
        Map<String, Long> skillCounts = allSkills.stream()
                .filter(sk -> sk.getName() != null && !sk.getName().isBlank())
                .collect(Collectors.groupingBy(sk -> sk.getName().trim(), Collectors.counting()));

        List<Map<String, Object>> topSkills = skillCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(8)
                .map(e -> Map.of("name", (Object) e.getKey(), "count", (Object) e.getValue()))
                .collect(Collectors.toList());

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalStudents", total);
        analytics.put("averageScore", Math.round(avgScore * 10.0) / 10.0);
        analytics.put("readinessDistribution", readinessDist);
        analytics.put("studentsNeedingImprovement", needingImprovement);
        analytics.put("departmentStats", deptStats);
        analytics.put("topSkills", topSkills);

        return ResponseEntity.ok(analytics);
    }
}
