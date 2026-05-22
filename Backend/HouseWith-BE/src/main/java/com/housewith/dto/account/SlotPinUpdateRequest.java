package com.housewith.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-22/1026i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-22/1026i
 * 수정 내용:
 * 역할: PIN 번호 수정 요청 시 변경할 정보 입력 및 유효성 검증용 DTO */

@Getter
@NoArgsConstructor
public class SlotPinUpdateRequest {
    @NotBlank(message = "인증 정보가 만료되었거나 누락되었습니다. 이전 화면으로 돌아가 다시 시도해주세요.")
    private String password; 

    // null, 빈 문자열은 @Pattern 통과
    @Pattern(regexp = "^$|^\\d{6}$", message = "핀번호는 6자리 숫자여야 합니다.")
    private String newPinCode; 
}