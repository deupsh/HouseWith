package com.housewith.dto.account;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1453i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1706i
 * 수정 내용: Integer profileEmoji → String profileEmoji
 * 역할: 로그인 응답에 포함되는 개별 슬롯 정보 DTO */

@Getter
@AllArgsConstructor
public class SlotItem {

    private Long slotId; // 슬롯 PK
    private String pinCode; // 슬롯 PIN 번호
    private String nickname; // 닉네임
    private String profileEmoji; // 이모지 경로
    private Integer profileBackground; // 배경색 번호
    private String customProfileImage; // 프로필 사진 파일명
}