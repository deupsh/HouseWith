package com.housewith.domain.photo;

import java.time.LocalDate;
import com.housewith.domain.account.User;
import com.housewith.domain.account.Profile;

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
 * 마지막 수정 시간:2026-05-21/1220i
 * 수정 내용: Update 메소드 추가 (.save → 더티 체킹)
 * 역할: photos 테이블의 Entity */

@Entity
@Table(name = "photos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Photo {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; 

    @Column(length = 255)
    private String title;

    @Column(name = "photo_date")
    private LocalDate photoDate; 

    @Column(name = "album_name", length = 100)
    private String albumName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private Profile uploadedBy; 

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "is_representative", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isRepresentative = false;

    @Builder
    public Photo(User user, String title, LocalDate photoDate, String albumName, Profile uploadedBy, String fileName, Boolean isRepresentative) {
        this.user = user;
        this.title = title;
        this.photoDate = photoDate;
        this.albumName = albumName;
        this.uploadedBy = uploadedBy;
        this.fileName = fileName;
        this.isRepresentative = (isRepresentative != null) ? isRepresentative : false;
    }
    
    // 일정 수정 메소드 (JPA의 .save 공통 메소드가 아닌 Entity에 작성)
    public void changeRepresentativeStatus(Boolean status) {
        this.isRepresentative = status;
    }
}