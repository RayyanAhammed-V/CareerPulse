package com.example.demo.repository;

import com.example.demo.model.Hackathon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HackathonRepository extends JpaRepository<Hackathon, Long> {
    List<Hackathon> findByStudentId(Long studentId);
    Optional<Hackathon> findByIdAndStudentId(Long id, Long studentId);
}
