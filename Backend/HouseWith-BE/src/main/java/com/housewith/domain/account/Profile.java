package com.housewith.domain.account;

import java.time.LocalDateTime;

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
@Table(name = "profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // FK

    @Column(nullable = false, length = 10)
    private String nickname;

    @Column(name = "pin_code" , nullable = false, length = 255)
    private String pinCode;

    @Column(name = "emoji_id", columnDefinition = "INT")
    private Integer emojiId = 0;

    @Column(name = "background_id", columnDefinition = "INT")
    private Integer backgroundId = 0;

    @Column(name = "custom_profile_image", length = 255)
    private String customProfileImage;

    @Column(name = "profile_type", columnDefinition = "TINYINT")
    private Integer profileType = 0; // 0: 이모지, 1: 커스텀

    @Column(name = "last_access_time")
    private LocalDateTime lastAccessTime;

    @Builder
    public Profile(User user, String nickname, String pinCode, Integer emojiId, Integer backgroundId, String customProfileImage) {
        this.user = user;
        this.nickname = nickname;
        this.pinCode = pinCode;
        // DTO에서 안 들어오면 0 처리
        this.emojiId = (emojiId != null) ? emojiId : 0;
        this.backgroundId = (backgroundId != null) ? backgroundId : 0;
        this.customProfileImage = customProfileImage;
        // 커스텀 이미지가 존재하면 타입 1, 아니면 0(이모지)
        this.profileType = (customProfileImage != null && !customProfileImage.isEmpty()) ? 1 : 0;
        this.lastAccessTime = null;
    }
    
    // 프로필 정보 수정 비즈니스 로직 
    public void modifyProfileDetails(String nickname, String pinCode, Integer emojiId, Integer backgroundId, String customProfileImage) {
        if (nickname != null) this.nickname = nickname;
        if (pinCode != null) this.pinCode = pinCode;
        if (emojiId != null) this.emojiId = emojiId;
        if (backgroundId != null) this.backgroundId = backgroundId;
        
        // 이미지와 프로필 타입(profileType) 동기화 처리
        if (customProfileImage != null && !customProfileImage.isEmpty()) {
            this.customProfileImage = customProfileImage;
            this.profileType = 1; // 사진 업로드 시 타입 1로 변경
        } else if (emojiId != null || backgroundId != null) {
            this.customProfileImage = null; // 이모지로 바꿨다면 기존 사진 경로 초기화
            this.profileType = 0; // 이모지 타입 0으로 변경
        }
    }

    // 앱 마지막 접속 시간 갱신 로직
    public void updateLastAccessTime(LocalDateTime now) {
        this.lastAccessTime = now;
    }
}

