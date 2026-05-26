package com.housewith.dto.communication;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-26/1442i
 * 마지막 수정자: 
 * 마지막 수정 시간:
 * 수정 내용: 
 * 역할: 주간 질문 수신 여부 변경 요청 담당 DTO */

@Getter
@NoArgsConstructor
public class QuestionSettingRequest {
    
    @NotNull(message = "설정값은 필수입니다.")
    @JsonProperty("isReceivingQuestion")
    private Boolean isReceivingQuestion; // 주간 질문 수신 여부 (0: 수신 X, 1: 수신)
}