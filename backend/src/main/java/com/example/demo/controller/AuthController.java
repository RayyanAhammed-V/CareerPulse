package com.example.demo.controller;

import com.example.demo.model.Student;
import com.example.demo.model.User;
import com.example.demo.model.AuditLog;
import com.example.demo.repository.StudentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.AuditLogRepository;
import com.example.demo.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuditLogRepository auditLogRepository;

    // 1. Universal & Role-Based Signup (Student, Faculty, Recruiter)
    @PostMapping(value = {"/signup", "/student/signup", "/faculty/signup", "/recruiter/signup"})
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String confirmPassword = request.get("confirmPassword");
            String fullName = request.get("fullName");
            String phone = request.get("phone");
            String department = request.get("department");
            String degree = request.get("degree");
            String role = request.get("role");

            String uri = httpRequest.getRequestURI();
            String targetRole = "ROLE_STUDENT";
            if (uri.contains("/faculty")) {
                targetRole = "ROLE_FACULTY";
            } else if (uri.contains("/recruiter")) {
                targetRole = "ROLE_RECRUITER";
            } else if (role != null && !role.isBlank()) {
                String r = role.toUpperCase();
                if (r.contains("FACULTY")) {
                    targetRole = "ROLE_FACULTY";
                } else if (r.contains("RECRUITER")) {
                    targetRole = "ROLE_RECRUITER";
                }
            }

            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
            }

            if (confirmPassword != null && !password.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match."));
            }

            if (password.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters long."));
            }

            if (userRepository.findByEmail(email.trim().toLowerCase()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "An account with this email already exists."));
            }

            User user = new User();
            user.setEmail(email.trim().toLowerCase());
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole(targetRole);
            user.setIsActive(true);
            user.setPasswordResetRequired(false);
            user.setCreatedAt(LocalDateTime.now());
            user = userRepository.save(user);

            // If Student, create Student Profile
            if ("ROLE_STUDENT".equals(targetRole)) {
                Student student = new Student();
                student.setUser(user);
                String[] names = fullName != null ? fullName.trim().split("\\s+", 2) : new String[]{"Student", ""};
                student.setFirstName(names[0]);
                student.setLastName(names.length > 1 ? names[1] : "");
                student.setPhone(phone);
                student.setDepartment(department != null && !department.isBlank() ? department : "Computer Science & Engineering");
                student.setDegree(degree != null && !degree.isBlank() ? degree : "B.Tech");
                student.setEmployabilityScore(0);
                student.setReadinessLevel("Needs Development");
                studentRepository.save(student);
            }

            auditLogRepository.save(new AuditLog(targetRole.replace("ROLE_", ""), "USER_CREATED", user.getEmail(), targetRole.replace("ROLE_", "") + " self-registration completed"));

            String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole(), false);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", sanitizeUser(user));
            response.put("role", user.getRole());
            response.put("message", "Registration successful. Welcome to Career Navigator!");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Signup failed: " + e.getMessage()));
        }
    }

    // 2. Student Login
    @PostMapping("/student/login")
    public ResponseEntity<?> studentLogin(@RequestBody Map<String, String> request) {
        return processLogin(request.get("email"), request.get("password"), "ROLE_STUDENT");
    }

    // 3. Faculty Login
    @PostMapping("/faculty/login")
    public ResponseEntity<?> facultyLogin(@RequestBody Map<String, String> request) {
        return processLogin(request.get("email"), request.get("password"), "ROLE_FACULTY");
    }

    // 4. Recruiter Login
    @PostMapping("/recruiter/login")
    public ResponseEntity<?> recruiterLogin(@RequestBody Map<String, String> request) {
        return processLogin(request.get("email"), request.get("password"), "ROLE_RECRUITER");
    }

    // 5. Admin Login
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> request) {
        return processLogin(request.get("email"), request.get("password"), "ROLE_ADMIN");
    }

    // Common authentication helper
    private ResponseEntity<?> processLogin(String email, String password, String expectedRole) {
        try {
            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
            }

            Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password."));
            }

            User user = userOpt.get();

            if (Boolean.FALSE.equals(user.getIsActive())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Your account has been deactivated. Please contact the administrator."));
            }

            // Verify password
            boolean passwordMatches = passwordEncoder.matches(password, user.getPasswordHash());
            if (!passwordMatches) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password."));
            }

            // Verify role access (ROLE_ADMIN has super-access across portals)
            String userRole = user.getRole();
            if (!"ROLE_ADMIN".equals(userRole) && !expectedRole.equals(userRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized portal access for your account role."));
            }

            boolean resetRequired = Boolean.TRUE.equals(user.getPasswordResetRequired());
            String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole(), resetRequired);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", sanitizeUser(user));
            response.put("role", user.getRole());
            response.put("passwordResetRequired", resetRequired);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Authentication error: " + (e.getMessage() != null ? e.getMessage() : "Database connection issue, please try again.")
            ));
        }
    }

    // 6. Force / Change Password
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        Long userId = (Long) httpRequest.getAttribute("userId");
        if (userId == null) {
            String token = extractBearer(httpRequest);
            if (token != null && tokenProvider.validateToken(token)) {
                userId = tokenProvider.getUserIdFromJWT(token);
            }
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required to change password."));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found."));
        }

        User user = userOpt.get();
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters."));
        }

        // Verify current password if provided
        if (currentPassword != null && !currentPassword.isBlank()) {
            if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Current password does not match."));
            }
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetRequired(false);
        userRepository.save(user);

        auditLogRepository.save(new AuditLog(user.getEmail(), "PASSWORD_RESET", user.getEmail(), "Password successfully changed and temporary state cleared"));

        String newToken = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole(), false);

        return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully.",
                "token", newToken,
                "passwordResetRequired", false
        ));
    }

    private String extractBearer(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("role", user.getRole());
        map.put("isActive", user.getIsActive());
        map.put("passwordResetRequired", user.getPasswordResetRequired());
        map.put("createdAt", user.getCreatedAt());
        return map;
    }
}
