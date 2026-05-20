package com.housewith.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1435i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1435i
 * 수정 내용: 
 * 역할: 로그인 요청 DTO */

@Getter
@NoArgsConstructor
public class LoginRequest {

	@NotBlank(message = "이메일을 입력해주세요")
    private String email;       // 사용자 ID (이메일 형식)
	@NotBlank(message = "비밀번호를 입력해주세요")
    private String password;    // 비밀번호 (영어+숫자 조합 4~20자)
}