package com.housewith.persistence.communication;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.housewith.domain.communication.FamilyMood;

/** 작성자: 박성현
 * 작성 시간: 2026-05-20/1021i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1021i
 * 수정 내용: 
 * 역할: 메인 화면의 '오늘의 가족 기분' 데이터 영속성 관리 및 유효 시간(24시간) 필터링 조회 */

public interface FamilyMoodRepository extends JpaRepository<FamilyMood, Long> {
	// 7_1 오늘의 기분: 작성 시간 기준 24시간 이내의 기분만 가져오기
	List<FamilyMood> findByUserIdAndCreatedAtAfter(Long userId, LocalDateTime twentyFourHoursAgo);
}