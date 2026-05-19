package com.housewith.domain.communication;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
    name = "family_moods",
    indexes = {@Index(name = "idx_family_moods_profile", columnList = "profile_id")}
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class FamilyMood {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mood_id")
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "profile_id")
    private Long profileId;

    @Column(name = "mood_text", nullable = false, length = 255)
    private String moodText;

    @CreatedDate
    @Column(name = "created_at", columnDefinition = "DATETIME(6)", updatable = false)
    private LocalDateTime createdAt;
}
