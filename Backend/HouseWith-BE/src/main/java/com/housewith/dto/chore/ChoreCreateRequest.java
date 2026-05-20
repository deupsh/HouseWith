package com.housewith.dto.chore;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1539i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1539i
 * 수정 내용: 
 * 역할: 집안일 등록 요청 시 제목, 반복 주기, 담당자 입력 및 유효성 검증용 DTO */

@Getter
@NoArgsConstructor
public class ChoreCreateRequest {

    @NotBlank(message = "집안일 제목을 입력해주세요")
    @Size(min = 1, max = 20, message = "집안일 제목은 1~20자여야 합니다")
    private String title; // 집안일 제목

    @NotNull(message = "반복 주기를 선택해주세요")
    private Integer cycleType;          // 반복주기 | 0: 매일, 1: 매주, 2: 매월

    private Integer scheduledDate;      // 날짜 지정 | 매주: 요일(0~6), 매월: 날짜(1~31), 매일: null

    @NotEmpty(message = "담당자를 1명 이상 선택해주세요")
    private List<Long> participantSlotIds; // 담당자 슬롯 목록
}