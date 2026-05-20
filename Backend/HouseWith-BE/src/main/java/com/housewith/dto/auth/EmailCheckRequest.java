package com.housewith.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1444i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1444i
 * 수정 내용: 
 * 역할: 회원 가입 시 이메일 중복 확인용 DTO */

@Getter
@NoArgsConstructor
public class EmailCheckRequest {

    @NotBlank(message = "이메일을 입력해주세요")
    @Email(message = "이메일 형식이 올바르지 않습니다")
    private String email; // 사용자가 입력한 이메일
}