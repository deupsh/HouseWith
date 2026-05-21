package com.housewith.dto.account;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1502i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1707i
 * 수정 내용: Integer profileEmoji → String profileEmoji
 * 역할: 슬롯 접속 성공 시 해당 슬롯 정보 반환용 응답 DTO */

@Getter
@AllArgsConstructor
public class SlotLoginResponse {

    private Long slotId; // 슬롯 PK
    private String nickname; // 닉네임
    private String profileEmoji; // 이모지 경로
    private Integer profileBackground; // 배경색 번호
    private String customProfileImage; // 프로필 사진 파일명
}