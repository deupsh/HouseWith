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
import lombok.Getter;
import lombok.NoArgsConstructor;

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
}