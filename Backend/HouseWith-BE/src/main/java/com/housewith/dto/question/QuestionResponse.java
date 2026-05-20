package com.housewith.dto.question;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1611i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1611i
 * 수정 내용: 
 * 역할: 주간 질의응답 화면 조회 시 질문 내용, 내 답변, 가족 구성원 답변 목록 반환용 응답 DTO */

@Getter
@AllArgsConstructor
public class QuestionResponse {

    private Long questionId; // 질문 PK
    private String content;             // 질문 내용
    private String weekLabel;           // 주차 표시 라벨 (예: "2026년 21주차")
    private String myAnswer;            // 내 답변 (미제출 시 null)
    private List<FamilyAnswer> answers; // 내가 답변 완료 시에만 노출, 미완료 시 빈 리스트
}