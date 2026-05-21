package com.housewith.dto.communication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1506i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1506i
 * 수정 내용: 
 * 역할: 오늘의 기분 작성 요청 시 내용 입력 및 유효성 검증용 DTO */

@Getter
@NoArgsConstructor
public class MoodCreateRequest {

    @NotBlank(message = "기분 내용을 입력해주세요")
    @Size(min = 1, max = 20, message = "기분 내용은 1~20자여야 합니다")
    private String content; // 오늘의 기분 내용
}