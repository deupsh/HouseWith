package com.housewith.persistence.schedule;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.housewith.domain.schedule.Calendar;

/** 작성자: 박성현
 * 작성 시간: 2026-05-20/1014i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1014i
 * 수정 내용: 
 * 역할: 캘린더 도메인의 일정 데이터 영속성 관리 및 특정 기간(월/일) 기준 조회 */

public interface CalendarRepository extends JpaRepository<Calendar, Long> {
    // 4_2 일정 조회: 달력에 표시하기 위해 특정 월/일 기간 안의 일정 가져오기
    List<Calendar> findByUser_IdAndStartTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);
}