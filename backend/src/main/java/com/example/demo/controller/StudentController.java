package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.EmployabilityScoreService;
import com.example.demo.service.RecommendationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(originPatterns = "*")
public class StudentController {

    @Autowired private StudentRepository studentRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private CertificationRepository certRepo;
    @Autowired private HackathonRepository hackathonRepo;
    @Autowired private ScoreHistoryRepository scoreHistoryRepo;
    @Autowired private EmployabilityScoreService scoreService;
    @Autowired private RecommendationService recommendationService;

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    // 1. Get current student profile & metrics
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Student> studentOpt = studentRepo.findById(userId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student profile not found."));
        }

        Student student = studentOpt.get();
        List<Skill> skills = skillRepo.findByStudentId(userId);
        List<Project> projects = projectRepo.findByStudentId(userId);
        List<Internship> internships = internshipRepo.findByStudentId(userId);
        List<Certification> certs = certRepo.findByStudentId(userId);
        List<Hackathon> hackathons = hackathonRepo.findByStudentId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("student", student);
        response.put("skillsCount", skills.size());
        response.put("projectsCount", projects.size());
        response.put("internshipsCount", internships.size());
        response.put("certificationsCount", certs.size());
        response.put("hackathonsCount", hackathons.size());
        response.put("employabilityScore", student.getEmployabilityScore() != null ? student.getEmployabilityScore() : 0);
        response.put("readinessLevel", student.getReadinessLevel() != null ? student.getReadinessLevel() : "Needs Development");

        // Calculate profile completion percentage
        int completion = 0;
        if (student.getFirstName() != null && !student.getFirstName().isBlank()) completion += 10;
        if (student.getPhone() != null && !student.getPhone().isBlank()) completion += 10;
        if (student.getDepartment() != null && !student.getDepartment().isBlank()) completion += 10;
        if (student.getCgpa() != null && student.getCgpa() > 0) completion += 15;
        if (!skills.isEmpty()) completion += 20;
        if (!projects.isEmpty()) completion += 15;
        if (!internships.isEmpty()) completion += 10;
        if (!certs.isEmpty()) completion += 10;
        response.put("profileCompletion", Math.min(100, completion));

        return ResponseEntity.ok(response);
    }

    // 2. Update student profile
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody Student updateData, HttpServletRequest request) {
        Long userId = getUserId(request);
        Student student = studentRepo.findById(userId).orElse(null);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student profile not found."));
        }

        if (updateData.getFirstName() != null) student.setFirstName(updateData.getFirstName());
        if (updateData.getLastName() != null) student.setLastName(updateData.getLastName());
        if (updateData.getPhone() != null) student.setPhone(updateData.getPhone());
        if (updateData.getDepartment() != null) student.setDepartment(updateData.getDepartment());
        if (updateData.getDegree() != null) student.setDegree(updateData.getDegree());
        if (updateData.getSemester() != null) student.setSemester(updateData.getSemester());
        if (updateData.getBatch() != null) student.setBatch(updateData.getBatch());
        if (updateData.getAcademicYear() != null) student.setAcademicYear(updateData.getAcademicYear());
        if (updateData.getCgpa() != null) student.setCgpa(updateData.getCgpa());
        if (updateData.getBacklogs() != null) student.setBacklogs(updateData.getBacklogs());
        if (updateData.getGithubUrl() != null) student.setGithubUrl(updateData.getGithubUrl());
        if (updateData.getLinkedinUrl() != null) student.setLinkedinUrl(updateData.getLinkedinUrl());
        if (updateData.getPortfolioUrl() != null) student.setPortfolioUrl(updateData.getPortfolioUrl());

        studentRepo.save(student);
        scoreService.calculateAndUpdateScore(userId);

        return ResponseEntity.ok(student);
    }

    // ==========================================
    // SKILLS CRUD
    // ==========================================
    @GetMapping("/me/skills")
    public ResponseEntity<List<Skill>> getMySkills(HttpServletRequest request) {
        return ResponseEntity.ok(skillRepo.findByStudentId(getUserId(request)));
    }

    @PostMapping("/me/skills")
    public ResponseEntity<?> addSkill(@RequestBody Skill skill, HttpServletRequest request) {
        Long userId = getUserId(request);
        skill.setStudentId(userId);
        Skill saved = skillRepo.save(skill);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/me/skills/{id}")
    public ResponseEntity<?> updateSkill(@PathVariable Long id, @RequestBody Skill updateData, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Skill> opt = skillRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Skill s = opt.get();
        if (updateData.getName() != null) s.setName(updateData.getName());
        if (updateData.getCategory() != null) s.setCategory(updateData.getCategory());
        if (updateData.getProficiency() != null) s.setProficiency(updateData.getProficiency());
        skillRepo.save(s);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(s);
    }

    @DeleteMapping("/me/skills/{id}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Skill> opt = skillRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        skillRepo.delete(opt.get());
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(Map.of("message", "Skill deleted successfully"));
    }

    // ==========================================
    // PROJECTS CRUD
    // ==========================================
    @GetMapping("/me/projects")
    public ResponseEntity<List<Project>> getMyProjects(HttpServletRequest request) {
        return ResponseEntity.ok(projectRepo.findByStudentId(getUserId(request)));
    }

    @PostMapping("/me/projects")
    public ResponseEntity<?> addProject(@RequestBody Project project, HttpServletRequest request) {
        Long userId = getUserId(request);
        project.setStudentId(userId);
        Project saved = projectRepo.save(project);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/me/projects/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Project updateData, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Project> opt = projectRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Project p = opt.get();
        if (updateData.getTitle() != null) p.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) p.setDescription(updateData.getDescription());
        if (updateData.getTechnologies() != null) p.setTechnologies(updateData.getTechnologies());
        if (updateData.getRole() != null) p.setRole(updateData.getRole());
        if (updateData.getDuration() != null) p.setDuration(updateData.getDuration());
        if (updateData.getProjectLink() != null) p.setProjectLink(updateData.getProjectLink());
        if (updateData.getGithubLink() != null) p.setGithubLink(updateData.getGithubLink());
        projectRepo.save(p);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(p);
    }

    @DeleteMapping("/me/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Project> opt = projectRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        projectRepo.delete(opt.get());
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }

    // ==========================================
    // CERTIFICATIONS CRUD
    // ==========================================
    @GetMapping("/me/certifications")
    public ResponseEntity<List<Certification>> getMyCertifications(HttpServletRequest request) {
        return ResponseEntity.ok(certRepo.findByStudentId(getUserId(request)));
    }

    @PostMapping("/me/certifications")
    public ResponseEntity<?> addCertification(@RequestBody Certification cert, HttpServletRequest request) {
        Long userId = getUserId(request);
        cert.setStudentId(userId);
        Certification saved = certRepo.save(cert);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/me/certifications/{id}")
    public ResponseEntity<?> updateCertification(@PathVariable Long id, @RequestBody Certification updateData, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Certification> opt = certRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Certification c = opt.get();
        if (updateData.getName() != null) c.setName(updateData.getName());
        if (updateData.getIssuer() != null) c.setIssuer(updateData.getIssuer());
        if (updateData.getIssueDate() != null) c.setIssueDate(updateData.getIssueDate());
        if (updateData.getExpiryDate() != null) c.setExpiryDate(updateData.getExpiryDate());
        if (updateData.getCredentialId() != null) c.setCredentialId(updateData.getCredentialId());
        if (updateData.getCredentialUrl() != null) c.setCredentialUrl(updateData.getCredentialUrl());
        certRepo.save(c);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(c);
    }

    @DeleteMapping("/me/certifications/{id}")
    public ResponseEntity<?> deleteCertification(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Certification> opt = certRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        certRepo.delete(opt.get());
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(Map.of("message", "Certification deleted successfully"));
    }

    // ==========================================
    // INTERNSHIPS CRUD
    // ==========================================
    @GetMapping("/me/internships")
    public ResponseEntity<List<Internship>> getMyInternships(HttpServletRequest request) {
        return ResponseEntity.ok(internshipRepo.findByStudentId(getUserId(request)));
    }

    @PostMapping("/me/internships")
    public ResponseEntity<?> addInternship(@RequestBody Internship internship, HttpServletRequest request) {
        Long userId = getUserId(request);
        internship.setStudentId(userId);
        Internship saved = internshipRepo.save(internship);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/me/internships/{id}")
    public ResponseEntity<?> updateInternship(@PathVariable Long id, @RequestBody Internship updateData, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Internship> opt = internshipRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Internship i = opt.get();
        if (updateData.getOrganization() != null) i.setOrganization(updateData.getOrganization());
        if (updateData.getRole() != null) i.setRole(updateData.getRole());
        if (updateData.getStartDate() != null) i.setStartDate(updateData.getStartDate());
        if (updateData.getEndDate() != null) i.setEndDate(updateData.getEndDate());
        if (updateData.getDescription() != null) i.setDescription(updateData.getDescription());
        if (updateData.getTechnologies() != null) i.setTechnologies(updateData.getTechnologies());
        internshipRepo.save(i);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(i);
    }

    @DeleteMapping("/me/internships/{id}")
    public ResponseEntity<?> deleteInternship(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Internship> opt = internshipRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        internshipRepo.delete(opt.get());
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(Map.of("message", "Internship deleted successfully"));
    }

    // ==========================================
    // HACKATHONS CRUD
    // ==========================================
    @GetMapping("/me/hackathons")
    public ResponseEntity<List<Hackathon>> getMyHackathons(HttpServletRequest request) {
        return ResponseEntity.ok(hackathonRepo.findByStudentId(getUserId(request)));
    }

    @PostMapping("/me/hackathons")
    public ResponseEntity<?> addHackathon(@RequestBody Hackathon hackathon, HttpServletRequest request) {
        Long userId = getUserId(request);
        hackathon.setStudentId(userId);
        Hackathon saved = hackathonRepo.save(hackathon);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/me/hackathons/{id}")
    public ResponseEntity<?> updateHackathon(@PathVariable Long id, @RequestBody Hackathon updateData, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Hackathon> opt = hackathonRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Hackathon h = opt.get();
        if (updateData.getName() != null) h.setName(updateData.getName());
        if (updateData.getOrganizer() != null) h.setOrganizer(updateData.getOrganizer());
        if (updateData.getDate() != null) h.setDate(updateData.getDate());
        if (updateData.getAchievement() != null) h.setAchievement(updateData.getAchievement());
        if (updateData.getTeamSize() != null) h.setTeamSize(updateData.getTeamSize());
        if (updateData.getDescription() != null) h.setDescription(updateData.getDescription());
        if (updateData.getLink() != null) h.setLink(updateData.getLink());
        hackathonRepo.save(h);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(h);
    }

    @DeleteMapping("/me/hackathons/{id}")
    public ResponseEntity<?> deleteHackathon(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Hackathon> opt = hackathonRepo.findByIdAndStudentId(id, userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        hackathonRepo.delete(opt.get());
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(Map.of("message", "Hackathon deleted successfully"));
    }

    // ==========================================
    // SCORE, RECOMMENDATIONS & HISTORY
    // ==========================================
    @GetMapping("/me/employability-score")
    public ResponseEntity<?> getEmployabilityScore(HttpServletRequest request) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(scoreService.getScoreBreakdown(userId));
    }

    @GetMapping("/me/recommendations")
    public ResponseEntity<?> getRecommendations(HttpServletRequest request) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(recommendationService.generateRecommendations(userId));
    }

    @GetMapping("/me/score-history")
    public ResponseEntity<?> getScoreHistory(HttpServletRequest request) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(scoreHistoryRepo.findByStudentIdOrderByCreatedAtDesc(userId));
    }
}
