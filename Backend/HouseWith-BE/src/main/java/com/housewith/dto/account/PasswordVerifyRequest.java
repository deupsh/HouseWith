package com.housewith.dto.account;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-22/1028i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-22/1028i
 * 수정 내용:
 * 역할: 비밀번호 검증용 DTO */

@Getter
@NoArgsConstructor
public class PasswordVerifyRequest {
    @NotBlank(message = "계정 비밀번호를 입력해주세요.")
    private String password;
}