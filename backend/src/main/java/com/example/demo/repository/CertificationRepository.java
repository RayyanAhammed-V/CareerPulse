package com.example.demo.repository;

import com.example.demo.model.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByStudentId(Long studentId);
    Optional<Certification> findByIdAndStudentId(Long id, Long studentId);
}
