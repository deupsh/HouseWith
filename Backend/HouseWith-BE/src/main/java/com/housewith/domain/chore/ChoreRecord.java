package com.housewith.domain.chore;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "chore_records",
    indexes = {@Index(name = "idx_chore_records_chore", columnList = "chore_id")}
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChoreRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "profile_id", nullable = false)
    private Long profileId;

    @Column(name = "chore_id", nullable = false)
    private Long choreId;

    @Column(name = "is_completed", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isCompleted = false;

    @Column(name = "completed_at", columnDefinition = "DATETIME(6)")
    private LocalDateTime completedAt; 
}
