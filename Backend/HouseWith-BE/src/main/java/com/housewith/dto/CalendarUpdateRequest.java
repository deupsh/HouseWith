package com.housewith.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1526i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1526i
 * 수정 내용: 
 * 역할: 일정 수정 요청 시 변경할 일정 정보 입력 및 유효성 검증용 DTO */

@Getter
@NoArgsConstructor
public class CalendarUpdateRequest {

    @Size(min = 1, max = 20, message = "일정 제목은 1~20자여야 합니다")
    private String title; // 수정할 일정 제목

    private LocalDateTime startDateTime; // 수정할 시작 날짜 및 시간

    private LocalDateTime endDateTime; // 수정할 종료 날짜 및 시간

    @Size(max = 100, message = "메모는 100자 이내여야 합니다")
    private String memo; // 수정할 메모

    private List<Long> participantSlotIds; // 수정할 참여 멤버 슬롯 PK 목록
}