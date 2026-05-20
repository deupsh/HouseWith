package com.housewith.persistence.schedule;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.housewith.domain.schedule.CalendarParticipant;

/** 작성자: 박성현
 * 작성 시간: 2026-05-20/1015i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1015i
 * 수정 내용: 
 * 역할: 특정 일정에 참여하는 멤버(슬롯) 매핑 정보 관리 및 수정/삭제 시 동기화 */

public interface CalendarParticipantRepository extends JpaRepository<CalendarParticipant, Long> {
    // 4_2 상세 조회: 특정 일정에 참여하는 멤버 PK 목록 가져오기
    List<CalendarParticipant> findByCalendarId(Long calendarId);
    
    // 4_3 일정 수정/삭제 시: 기존 참여자 매핑 데이터 싹 지우기
    void deleteByCalendarId(Long calendarId);
}