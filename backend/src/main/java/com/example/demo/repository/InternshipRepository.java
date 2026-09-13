package com.example.demo.repository;

import com.example.demo.model.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByStudentId(Long studentId);
    Optional<Internship> findByIdAndStudentId(Long id, Long studentId);
}
