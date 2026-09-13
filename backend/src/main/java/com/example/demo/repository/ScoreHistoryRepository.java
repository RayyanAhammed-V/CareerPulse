package com.example.demo.repository;

import com.example.demo.model.ScoreHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreHistoryRepository extends JpaRepository<ScoreHistory, Long> {
    List<ScoreHistory> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<ScoreHistory> findTop10ByStudentIdOrderByCreatedAtDesc(Long studentId);
}
