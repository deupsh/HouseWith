package com.housewith.domain.chore;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "chore_participants",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_chore_profile", columnNames = {"profile_id", "chore_id"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChoreParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long id;

    @Column(name = "profile_id", nullable = false)
    private Long profileId; 

    @Column(name = "chore_id", nullable = false)
    private Long choreId; 
}