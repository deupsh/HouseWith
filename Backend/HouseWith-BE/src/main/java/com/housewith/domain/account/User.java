package com.housewith.domain.account;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "group_name", nullable = false, length = 20)
    private String groupName;

    @Column(name = "current_question_id", columnDefinition = "BIGINT")
    private Long currentQuestionId; // 기본값 0

    @Column(name = "is_receiving_question", columnDefinition = "TINYINT(1)")
    private Boolean isReceivingQuestion = false; // 기본값은 0이고 이진으로 활성화 상태 판단

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Profile> profiles = new ArrayList<>();

    @Builder
    public User(String email, String password, String phoneNumber, String groupName) {
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.groupName = groupName;
        // 시스템 강제 초기값
        this.currentQuestionId = 0L;
        this.isReceivingQuestion = false;
    }
}
