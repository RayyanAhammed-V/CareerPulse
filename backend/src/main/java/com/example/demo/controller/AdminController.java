package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "*")
public class AdminController {

    @Autowired private UserRepository userRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private CertificationRepository certRepo;
    @Autowired private HackathonRepository hackathonRepo;
    @Autowired private ScoreHistoryRepository scoreHistoryRepo;
    @Autowired private AuditLogRepository auditLogRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    private String getAdminEmail(HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return email != null ? email : "admin@careernavigator.com";
    }

    // 1. Get system overview stats
    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        long totalUsers = userRepo.count();
        long totalStudents = userRepo.countByRole("ROLE_STUDENT");
        long totalFaculty = userRepo.countByRole("ROLE_FACULTY");
        long totalRecruiters = userRepo.countByRole("ROLE_RECRUITER");
        long activeAccounts = userRepo.countByIsActive(true);
        long disabledAccounts = userRepo.countByIsActive(false);

        List<AuditLog> recentLogs = auditLogRepo.findTop50ByOrderByTimestampDesc();
        long recoveryCount = recentLogs.stream().filter(l -> "PASSWORD_RESET".equals(l.getAction())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalStudents", totalStudents);
        stats.put("totalFaculty", totalFaculty);
        stats.put("totalRecruiters", totalRecruiters);
        stats.put("activeAccounts", activeAccounts);
        stats.put("disabledAccounts", disabledAccounts);
        stats.put("recoveryCount", recoveryCount);
        stats.put("recentLogs", recentLogs);

        return ResponseEntity.ok(stats);
    }

    // 2. List / Search Users
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestParam(required = false) String search, @RequestParam(required = false) String role) {
        List<User> users = userRepo.findAll();

        List<Map<String, Object>> result = users.stream().filter(u -> {
            if (role != null && !role.isBlank() && !role.equalsIgnoreCase("All")) {
                if (!u.getRole().equalsIgnoreCase(role) && !u.getRole().equalsIgnoreCase("ROLE_" + role)) {
                    return false;
                }
            }

            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase().trim();
                boolean emailMatch = u.getEmail().toLowerCase().contains(q);
                boolean idMatch = u.getId().toString().equals(q);
                boolean nameMatch = false;

                if (u.getId() != null) {
                    Optional<Student> studentOpt = studentRepo.findById(u.getId());
                    if (studentOpt.isPresent()) {
                        Student s = studentOpt.get();
                        String fullName = ((s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : "")).toLowerCase();
                        if (fullName.contains(q)) nameMatch = true;
                    }
                }
                if (!emailMatch && !idMatch && !nameMatch) return false;
            }

            return true;
        }).map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("isActive", u.getIsActive());
            map.put("passwordResetRequired", u.getPasswordResetRequired());
            map.put("createdAt", u.getCreatedAt());

            if ("ROLE_STUDENT".equals(u.getRole())) {
                studentRepo.findById(u.getId()).ifPresent(s -> {
                    map.put("fullName", (s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : ""));
                    map.put("department", s.getDepartment());
                    map.put("employabilityScore", s.getEmployabilityScore());
                    map.put("readinessLevel", s.getReadinessLevel());
                });
            }

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // 3. Create User (Privileged account creation: Faculty, Recruiter, Student)
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        String role = request.get("role");
        String fullName = request.get("fullName");
        String department = request.get("department");

        if (email == null || email.isBlank() || role == null || role.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and role are required."));
        }

        String normalizedRole = role.startsWith("ROLE_") ? role.toUpperCase() : "ROLE_" + role.toUpperCase();
        if (!List.of("ROLE_STUDENT", "ROLE_FACULTY", "ROLE_RECRUITER", "ROLE_ADMIN").contains(normalizedRole)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role specified."));
        }

        if (userRepo.findByEmail(email.trim().toLowerCase()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "An account with this email already exists."));
        }

        // Generate temporary password for newly created account
        String tempPassword = generateRandomPassword();

        User user = new User();
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setRole(normalizedRole);
        user.setIsActive(true);
        user.setPasswordResetRequired(true); // Force password change on first login
        user.setCreatedAt(LocalDateTime.now());
        user = userRepo.save(user);

        if ("ROLE_STUDENT".equals(normalizedRole)) {
            Student s = new Student();
            s.setUser(user);
            String[] names = fullName != null ? fullName.trim().split("\\s+", 2) : new String[]{"Student", ""};
            s.setFirstName(names[0]);
            s.setLastName(names.length > 1 ? names[1] : "");
            s.setDepartment(department);
            s.setEmployabilityScore(0);
            s.setReadinessLevel("Needs Development");
            studentRepo.save(s);
        }

        auditLogRepo.save(new AuditLog(getAdminEmail(httpRequest), "USER_CREATED", user.getEmail(), "Created account with role: " + normalizedRole));

        Map<String, Object> resp = new HashMap<>();
        resp.put("user", user);
        resp.put("temporaryPassword", tempPassword);
        resp.put("message", "User created successfully. Provide the temporary password to the user.");
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    // 4. Toggle Account Active / Disabled Status
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, HttpServletRequest httpRequest) {
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        boolean newStatus = !Boolean.TRUE.equals(user.getIsActive());
        user.setIsActive(newStatus);
        userRepo.save(user);

        String action = newStatus ? "USER_ENABLED" : "USER_DISABLED";
        auditLogRepo.save(new AuditLog(getAdminEmail(httpRequest), action, user.getEmail(), "Account status toggled to: " + (newStatus ? "Active" : "Disabled")));

        return ResponseEntity.ok(Map.of("id", user.getId(), "isActive", newStatus, "message", "User status updated to " + (newStatus ? "Active" : "Disabled")));
    }

    // 5. Generate Temporary Password (Account Recovery)
    @PostMapping("/users/{id}/generate-temp-password")
    public ResponseEntity<?> generateTempPassword(@PathVariable Long id, HttpServletRequest httpRequest) {
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        String tempPassword = generateRandomPassword();

        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setPasswordResetRequired(true); // Must change on next login
        userRepo.save(user);

        auditLogRepo.save(new AuditLog(getAdminEmail(httpRequest), "PASSWORD_RESET", user.getEmail(), "Generated secure temporary password for account recovery"));

        Map<String, Object> resp = new HashMap<>();
        resp.put("userId", user.getId());
        resp.put("email", user.getEmail());
        resp.put("temporaryPassword", tempPassword);
        resp.put("message", "Temporary password generated. Share this credential securely with the user. They will be forced to change it upon login.");
        return ResponseEntity.ok(resp);
    }

    // 6. Delete User
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletRequest httpRequest) {
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        String email = user.getEmail();

        // Cleanup associated student records if applicable
        if (studentRepo.existsById(id)) {
            skillRepo.deleteAll(skillRepo.findByStudentId(id));
            projectRepo.deleteAll(projectRepo.findByStudentId(id));
            internshipRepo.deleteAll(internshipRepo.findByStudentId(id));
            certRepo.deleteAll(certRepo.findByStudentId(id));
            hackathonRepo.deleteAll(hackathonRepo.findByStudentId(id));
            scoreHistoryRepo.deleteAll(scoreHistoryRepo.findByStudentIdOrderByCreatedAtDesc(id));
            studentRepo.deleteById(id);
        }

        userRepo.delete(user);
        auditLogRepo.save(new AuditLog(getAdminEmail(httpRequest), "USER_DELETED", email, "User and associated profile data deleted by admin"));

        return ResponseEntity.ok(Map.of("message", "User " + email + " deleted successfully."));
    }

    // 7. Get Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepo.findTop50ByOrderByTimestampDesc());
    }

    private String generateRandomPassword() {
        String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String lower = "abcdefghjkmnpqrstuvwxyz";
        String digits = "23456789";
        String special = "@#$%&*!";
        String all = upper + lower + digits + special;

        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        sb.append(upper.charAt(random.nextInt(upper.length())));
        sb.append(lower.charAt(random.nextInt(lower.length())));
        sb.append(digits.charAt(random.nextInt(digits.length())));
        sb.append(special.charAt(random.nextInt(special.length())));

        for (int i = 4; i < 10; i++) {
            sb.append(all.charAt(random.nextInt(all.length())));
        }

        return sb.toString();
    }
}
