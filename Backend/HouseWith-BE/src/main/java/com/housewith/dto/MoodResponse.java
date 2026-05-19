package com.housewith.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1509i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1509i
 * 수정 내용: 
 * 역할: 오늘의 가족 기분 화면에서 슬롯별 기분 및 미접속 넛지 판단용 응답 DTO */

@Getter
@AllArgsConstructor
public class MoodResponse {

    private Long slotId; // 슬롯 PK
    private String nickname; // 슬롯 닉네임
    private Integer profileEmoji; // 이모지 번호
    private Integer profileBackground; // 배경색 번호
    private String customProfileImage; // 프로필 이미지 파일명
    private String content; // 오늘의 기분 내용
    private LocalDateTime createdAt; // 작성 시간
    private LocalDateTime lastAccessTime; // 마지막 앱 접속 시간
}