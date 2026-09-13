package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "hackathons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hackathon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(nullable = false)
    private String name;

    private String organizer;

    private String date;

    private String achievement; // e.g. Winner, Runner Up, Finalist, Participant

    @Column(name = "team_size")
    private Integer teamSize;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String link;
}
