package com.housewith.dto.account;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1458i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-22/1612i
 * 수정 내용: Integer profileEmoji → String profileEmoji (박성현 - 2026-05-20/1710i)
 * Setter 어노테이션 추가 → ModelAttribute가 multipart/form-data를 파싱할때 GET/SET이 필요 
 * 역할: 슬롯 생성 요청 시 닉네임, 핀번호, 프로필 정보 입력 및 유효성 검증용 DTO */

@Getter
@Setter
@NoArgsConstructor
public class SlotCreateRequest {

    @NotBlank(message = "닉네임을 입력해주세요")
    @Size(min = 2, max = 10, message = "닉네임은 2~10자여야 합니다")
    private String nickname; // 닉네임

    @Pattern(
            regexp = "^$|^\\d{6}$", 
            message = "핀번호는 6자리 숫자여야 합니다."
        )
    private String pinCode; // 슬롯 진입용 핀번호 (선택)

    // 아이콘+색상 조합 선택 시 사용, 프로필 사진 선택 시 NULL
    private String profileEmoji; // 선택한 이모지 경로
    private Integer profileBackground; // 선택한 배경색 번호

    // 프로필 사진 선택 시 사용, 아이콘+색상 조합 선택 시 NULL
    private MultipartFile profileImage; // 프로필 사진 파일
}