package com.housewith.domain.schedule;

import java.time.LocalDateTime;

import com.housewith.domain.account.User;
import com.housewith.global.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "calendars")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Calendar extends BaseTimeEntity {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calendar_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; 

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    @Builder
    public Calendar(User user, String title, String content, LocalDateTime startTime, LocalDateTime endTime, Long uploadedBy) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.startTime = startTime;
        this.endTime = endTime;
        this.uploadedBy = uploadedBy;
    }
}
