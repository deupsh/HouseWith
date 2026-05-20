package com.housewith.dto.member;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1510i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1510i
 * 수정 내용: 
 * 역할: 슬롯 프로필 수정 요청 시 변경할 정보 입력 및 유효성 검증용 DTO */

@Getter
@NoArgsConstructor
public class SlotUpdateRequest {

    @Size(min = 2, max = 10, message = "닉네임은 2~10자여야 합니다")
    private String nickname; // 수정할 닉네임

    @Pattern(
        regexp = "^\\d{4,6}$",
        message = "핀번호는 4~6자리 숫자여야 합니다"
    )
    private String pinCode; // 수정할 핀번호

    // 아이콘+색상 조합 선택 시 사용, 프로필 사진 선택 시 NULL
    private Integer profileEmoji; // 수정할 이모지 번호
    private Integer profileBackground; // 수정할 배경색 번호

    // 프로필 사진 선택 시 사용, 아이콘+색상 조합 선택 시 NULL
    private MultipartFile profileImage; // 수정할 프로필 사진 파일
}