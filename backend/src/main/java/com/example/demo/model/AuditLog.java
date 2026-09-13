package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String actor;

    @Column(nullable = false)
    private String action; // USER_CREATED, USER_DISABLED, USER_ENABLED, PASSWORD_RESET, ROLE_CHANGED, USER_DELETED

    private String target;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public AuditLog(String actor, String action, String target, String details) {
        this.actor = actor;
        this.action = action;
        this.target = target;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}
