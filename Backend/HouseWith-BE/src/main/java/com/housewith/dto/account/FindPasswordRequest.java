package com.housewith.dto.account;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor 
public class FindPasswordRequest {
    @NotBlank(message = "이메일은 필수 입력 항목입니다.")
    private String email;
}