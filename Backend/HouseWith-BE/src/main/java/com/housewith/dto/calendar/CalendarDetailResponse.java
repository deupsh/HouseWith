package com.housewith.dto.calendar;

import java.time.LocalDateTime;
import java.util.List;

import com.housewith.dto.member.ParticipantInfo;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1533i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1533i
 * 수정 내용: 
 * 역할: 일정 상세 조회 시 제목, 날짜, 메모, 작성자, 참여 멤버 목록 반환용 응답 DTO */

@Getter
@AllArgsConstructor
public class CalendarDetailResponse {

    private Long calendarId; // 일정 PK
    private String title; // 일정 제목
    private LocalDateTime startDateTime; // 일정 시작 날짜 및 시간
    private LocalDateTime endDateTime; // 일정 종료 날짜 및 시간
    private String memo; // 일정 메모
    private String uploaderNickname; // 일정을 등록한 구성원 닉네임
    private List<ParticipantInfo> participants; // 참여 멤버 목록
}