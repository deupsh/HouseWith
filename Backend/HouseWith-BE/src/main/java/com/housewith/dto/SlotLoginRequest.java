package com.housewith.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1503i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1503i
 * 수정 내용: 
 * 역할: 슬롯 접속 요청 시 슬롯 ID와 핀번호 검증용 DTO */

@Getter
@NoArgsConstructor
public class SlotLoginRequest {

    @NotNull(message = "슬롯 ID를 입력해주세요")
    private Long slotId; // 슬롯 PK

    @NotBlank(message = "핀번호를 입력해주세요")
    private String pinCode; // 슬롯 진입용 핀번호
}