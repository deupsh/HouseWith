package com.housewith.dto;

import java.util.List;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1544i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1544i
 * 수정 내용: 
 * 역할: 집안일 수정 요청 시 변경할 제목, 반복 주기, 담당자 입력 및 유효성 검증용 DTO */

@Getter
@NoArgsConstructor
public class ChoreUpdateRequest {

    @Size(min = 1, max = 20, message = "집안일 제목은 1~20자여야 합니다")
    private String title; // 수정할 집안일 제목

    private Integer cycleType;          // 수정할 반복 주기 | 0: 매일, 1: 매주, 2: 매월

    private Integer scheduledDate;      // 수정할 날짜 지정 | 매주: 요일(0~6), 매월: 날짜(1~31), 매일: null

    private List<Long> participantSlotIds; // 수정할 담당자 슬롯 목록
}