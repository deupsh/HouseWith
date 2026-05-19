package com.housewith.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1514i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1514i
 * 수정 내용: 
 * 역할: 일정 등록 요청 시 제목, 날짜, 메모, 참여 멤버 입력 및 유효성 검증용 DTO */

@Getter
@NoArgsConstructor
public class CalendarCreateRequest {

    @NotBlank(message = "일정 제목을 입력해주세요")
    @Size(min = 1, max = 20, message = "일정 제목은 1~20자여야 합니다")
    private String title; // 일정 제목

    @NotNull(message = "시작 날짜 및 시간을 선택해주세요")
    private LocalDateTime startDateTime; // 시작 날짜 및 시간

    @NotNull(message = "종료 날짜 및 시간을 선택해주세요")
    private LocalDateTime endDateTime; // 종료 날짜 및 시간

    @Size(max = 100, message = "메모는 100자 이내여야 합니다")
    private String memo; // 일정 메모

    private List<Long> participantSlotIds; // 참여 멤버 슬롯 PK 목록
}