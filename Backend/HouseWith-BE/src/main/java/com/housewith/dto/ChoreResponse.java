package com.housewith.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1548i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1548i
 * 수정 내용: 
 * 역할: 집안일 목록 조회 시 제목, 반복 주기, 완료 여부, 담당자 목록 반환용 응답 DTO */

@Getter
@AllArgsConstructor
public class ChoreResponse {

    private Long choreId; // 집안일 PK
    private String title; // 집안일 제목
    private Integer cycleType;          // 반복 주기 | 0: 매일, 1: 매주, 2: 매월
    private Integer scheduledDate;      // 날짜 지정 | 매주: 요일(0~6), 매월: 날짜(1~31), 매일: null
    private boolean isDone; // 완료 여부
    private List<ParticipantInfo> participants; // 담당자 목록
}