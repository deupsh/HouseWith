package com.housewith.domain.schedule;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "calendar_participants",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_calendar_profile", columnNames = {"profile_id", "calendar_id"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CalendarParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long id;

    @Column(name = "profile_id", nullable = false)
    private Long profileId; 

    @Column(name = "calendar_id", nullable = false)
    private Long calendarId; 
    
    @Builder
    public CalendarParticipant(Long profileId, Long calendarId) {
        this.profileId = profileId;
        this.calendarId = calendarId;
    }
}