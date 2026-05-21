package com.housewith.dto.account;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1450i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1450i
 * 수정 내용: 
 * 역할: 로그인 성공 시 JWT 토큰 및 슬롯 목록 반환용 응답 DTO */

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String accessToken; // JWT 토큰
    private String tokenType;   // "Bearer" 고정
    private Long userId; // 로그인한 사용자
    private String groupName; // 가족 그룹명
    private List<SlotItem> slots; // 해당 계정에 속한 슬롯 목록
}