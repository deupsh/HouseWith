package com.housewith.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1446i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1446i
 * 수정 내용: 
 * 역할: 회원가입 시 사용자 정보 입력 및 유효성 검증용 DTO */

@Getter
@NoArgsConstructor
public class UserCreateRequest {

    @NotBlank(message = "이메일을 입력해주세요")
    @Email(message = "이메일 형식이 올바르지 않습니다")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{4,20}$",
        message = "비밀번호는 영어와 숫자를 포함한 4~20자여야 합니다"
    )
    private String password;

    @NotBlank(message = "전화번호를 입력해주세요")
    @Pattern(
        regexp = "^010-\\d{4}-\\d{4}$",
        message = "전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)"
    )
    private String phoneNumber;

    @NotBlank(message = "그룹명을 입력해주세요")
    @Size(min = 2, max = 20, message = "그룹명은 2~20자여야 합니다")
    private String groupName;
}