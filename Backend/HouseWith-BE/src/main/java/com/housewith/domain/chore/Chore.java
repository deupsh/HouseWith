package com.housewith.domain.chore;

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
@Table(name = "chores")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Chore extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chore_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "cycle_type", nullable = false)
    private Integer cycleType;

    @Column(name = "cycle_value", length = 50)
    private String cycleValue;
    
    @Builder
    public Chore(User user, Long createdBy, String title, Integer cycleType, String cycleValue) {
        this.user = user;
        this.createdBy = createdBy;
        this.title = title;
        this.cycleType = cycleType;
        this.cycleValue = cycleValue;
    }
    
    // 집안일 정보 수정 비즈니스 로직
    public void updateChoreDetails(String title, Integer cycleType, String cycleValue) {
        if (title != null) this.title = title;
        if (cycleType != null) this.cycleType = cycleType;
        this.cycleValue = cycleValue; // null 허용 필드
    }
}
