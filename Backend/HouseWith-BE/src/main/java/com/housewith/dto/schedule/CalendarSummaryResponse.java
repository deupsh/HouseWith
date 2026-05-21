package com.housewith.dto.schedule;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1530i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1530i
 * 수정 내용: 
 * 역할: 달력 기본 조회 시 일정 제목 및 날짜 반환용 응답 DTO */

@Getter
@AllArgsConstructor
public class CalendarSummaryResponse {

    private Long calendarId; // 일정 PK
    private String title; // 일정 제목
    private LocalDateTime startDateTime; // 일정 시작 일시
    private LocalDateTime endDateTime; // 일정 종료 일시
}