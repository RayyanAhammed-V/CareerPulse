package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "score_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoreHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "previous_score")
    private Integer previousScore;

    @Column(name = "current_score", nullable = false)
    private Integer currentScore;

    @Column(name = "readiness_level")
    private String readinessLevel;

    @Column(name = "skills_score")
    private Double skillsScore;

    @Column(name = "projects_score")
    private Double projectsScore;

    @Column(name = "internships_score")
    private Double internshipsScore;

    @Column(name = "certifications_score")
    private Double certificationsScore;

    @Column(name = "hackathons_score")
    private Double hackathonsScore;

    @Column(name = "academics_score")
    private Double academicsScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
