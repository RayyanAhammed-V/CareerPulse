package com.example.demo.controller;

import com.example.demo.model.Student;
import com.example.demo.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "${frontend.url}")
public class DashboardController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestParam String role) {
        Map<String, Object> stats = new HashMap<>();
        
        if ("FACULTY".equals(role) || "ADMIN".equals(role)) {
            List<Student> students = studentRepository.findAll();
            stats.put("totalStudents", students.size());
            double avgScore = students.stream()
                .mapToInt(s -> s.getEmployabilityScore() != null ? s.getEmployabilityScore() : 0)
                .average().orElse(0.0);
            stats.put("averageScore", Math.round(avgScore * 10.0) / 10.0);
            
            long readyCount = students.stream()
                .filter(s -> s.getEmployabilityScore() != null && s.getEmployabilityScore() >= 60)
                .count();
            stats.put("placementReady", readyCount);
            
            stats.put("studentsList", students);
        } else if ("STUDENT".equals(role)) {
            // Mock student data
            stats.put("employabilityScore", 75);
            stats.put("readinessLevel", "Highly Ready");
        } else if ("RECRUITER".equals(role)) {
            List<Student> students = studentRepository.findAll();
            stats.put("candidates", students);
        }
        
        return ResponseEntity.ok(stats);
    }
}
