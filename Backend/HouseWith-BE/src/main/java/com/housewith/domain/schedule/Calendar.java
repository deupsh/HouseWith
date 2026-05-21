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

/** 작성자: 백승훈
 * 작성 시간: 2026-05-19
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-21/0944i
 * 수정 내용: Update 메소드 추가 (.save → 더티 체킹)
 * 역할: calendars 테이블의 Entity */

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
    
    // 일정 수정 메소드 (JPA의 .save 공통 메소드가 아닌 Entity에 작성)
    public void modifyCalendarDetails(String title, String content, LocalDateTime startTime, LocalDateTime endTime) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("일정 제목은 필수입니다.");
        }
        this.title = title;
        this.content = content;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}