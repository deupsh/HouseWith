package com.housewith.persistence.chore;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.housewith.domain.chore.ChoreRecord;

/** 작성자: 박성현
 * 작성 시간: 2026-05-20/1017i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1017i
 * 수정 내용: 
 * 역할: 집안일 수행 기록 영속성 관리 및 주간 통계/AI 분석을 위한 완료 데이터 집계 */

public interface ChoreRecordRepository extends JpaRepository<ChoreRecord, Long> {
	
	// 5_3 집안일 목록 조회: 특정 날짜에 해당하는 내 집안일 목록을 화면에 뿌려주기 위해 필요
	List<ChoreRecord> findByProfileIdAndCompletedAtBetween(Long profileId, LocalDateTime start, LocalDateTime end);
	
	// 6_3 통계 자료 (일 평균, 참여율): 특정 기간(월~일) 동안 특정 유저(가족) 그룹에서 '완료된(isCompleted=true)' 기록 개수 세기
	@Query("SELECT COUNT(cr) FROM ChoreRecord cr JOIN Profile p ON cr.profileId = p.id WHERE p.user.id = :userId AND cr.isCompleted = true AND cr.completedAt BETWEEN :start AND :end")
	long countCompletedChoresThisWeek(@Param("userId") Long userId, @Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end);
}