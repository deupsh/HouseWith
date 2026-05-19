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

    @Column(name = "emoji_id", columnDefinition = "INT DEFAULT 0")
    private Integer emojiId = 0;

    @Column(name = "background_id", columnDefinition = "INT DEFAULT 0")
    private Integer backgroundId = 0;

    @Column(name = "custom_profile_image", length = 255)
    private String customProfileImage;

    @Column(name = "profile_type", columnDefinition = "TINYINT DEFAULT 0")
    private Integer profileType = 0; // 0: 이모지, 1: 커스텀

    @Column(name = "last_access_time")
    private LocalDateTime lastAccessTime;
}

