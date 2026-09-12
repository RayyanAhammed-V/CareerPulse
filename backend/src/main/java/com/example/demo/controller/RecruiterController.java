package com.example.demo.controller;

import com.example.demo.model.Student;
import com.example.demo.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter")
@CrossOrigin(origins = "${frontend.url}")
public class RecruiterController {

    @Autowired
    private StudentRepository studentRepo;

    @GetMapping("/students")
    public ResponseEntity<List<Student>> searchStudents() {
        // Mock search just returns all for now
        return ResponseEntity.ok(studentRepo.findAll());
    }
}
