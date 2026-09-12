package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.EmployabilityScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "${frontend.url}")
public class StudentProfileController {

    @Autowired private StudentRepository studentRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private CertificationRepository certRepo;
    @Autowired private HackathonRepository hackathonRepo;
    @Autowired private EmployabilityScoreService scoreService;

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    @GetMapping
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        Long userId = getUserId(request);
        Optional<Student> studentOpt = studentRepo.findById(userId);
        if (studentOpt.isEmpty()) return ResponseEntity.notFound().build();

        Map<String, Object> response = new HashMap<>();
        response.put("student", studentOpt.get());
        response.put("skills", skillRepo.findByStudentId(userId));
        response.put("projects", projectRepo.findByStudentId(userId));
        response.put("internships", internshipRepo.findByStudentId(userId));
        response.put("certifications", certRepo.findByStudentId(userId));
        response.put("hackathons", hackathonRepo.findByStudentId(userId));
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/academic")
    public ResponseEntity<?> updateAcademic(@RequestBody Map<String, Double> data, HttpServletRequest request) {
        Long userId = getUserId(request);
        Student student = studentRepo.findById(userId).orElseThrow();
        student.setCgpa(data.get("cgpa"));
        studentRepo.save(student);
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok(student);
    }

    @PostMapping("/{type}")
    public ResponseEntity<?> addEntity(@PathVariable String type, @RequestBody Map<String, String> data, HttpServletRequest request) {
        Long userId = getUserId(request);
        
        if ("skill".equals(type)) {
            Skill s = new Skill();
            s.setStudentId(userId);
            s.setName(data.get("name"));
            skillRepo.save(s);
        } else if ("project".equals(type)) {
            Project p = new Project();
            p.setStudentId(userId);
            p.setName(data.get("name"));
            p.setDescription(data.get("description"));
            projectRepo.save(p);
        } else if ("internship".equals(type)) {
            Internship i = new Internship();
            i.setStudentId(userId);
            i.setName(data.get("name"));
            internshipRepo.save(i);
        } else if ("certification".equals(type)) {
            Certification c = new Certification();
            c.setStudentId(userId);
            c.setName(data.get("name"));
            certRepo.save(c);
        } else if ("hackathon".equals(type)) {
            Hackathon h = new Hackathon();
            h.setStudentId(userId);
            h.setName(data.get("name"));
            hackathonRepo.save(h);
        }
        
        scoreService.calculateAndUpdateScore(userId);
        return ResponseEntity.ok().build();
    }
}
