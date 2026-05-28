package com.housewith.dto.account;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FindEmailRequest {
    @NotBlank(message = "전화번호는 필수 입력 항목입니다.")
    private String phoneNumber;
}