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
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "user_answers",
    indexes = {
        @Index(name = "idx_user_answers_profile", columnList = "profile_id"),
        @Index(name = "idx_user_answers_question", columnList = "question_id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class UserAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Long id;

    @Column(name = "profile_id", nullable = false)
    private Long profileId; 

    @Column(name = "question_id", nullable = false)
    private Long questionId; 

    @Column(nullable = false, length = 100)
    private String content;

    @CreatedDate
    @Column(name = "created_at", columnDefinition = "DATETIME(6)", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public UserAnswer(Long profileId, Long questionId, String content) {
        this.profileId = profileId;
        this.questionId = questionId;
        this.content = content;
    }
}
