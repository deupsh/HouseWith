package com.housewith.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1534i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1534i
 * 수정 내용: 
 * 역할: 일정 상세 조회, 집안일 목록 조회 시 참여 멤버의 슬롯 정보 반환용 DTO */

@Getter
@AllArgsConstructor
public class ParticipantInfo {

    private Long slotId; // 슬롯 PK
    private String nickname; // 슬롯 닉네임
    private Integer profileEmoji; // 이모지 번호
    private Integer profileBackground; // 배경 번호
    private String customProfileImage; // 프로필 이미지 파일명
}