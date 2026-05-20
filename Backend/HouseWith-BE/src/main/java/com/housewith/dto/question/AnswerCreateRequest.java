package com.housewith.dto.question;

import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 백승훈
 * 작성 시간: 2026-05-20/1701i
 * 마지막 수정자: 
 * 마지막 수정 시간
 * 수정 내용: 
 * 역할: 사용자가 입력한 텍스트 딱 하나만 받아 답변 제출용 DTO */

@Getter
@NoArgsConstructor
public class AnswerCreateRequest {
    private String content; 
}