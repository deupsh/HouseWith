package com.housewith.dto.statistic;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1618i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1618i
 * 수정 내용: 
 * 역할: 주간 통계에서 구성원별 집안일 완료 횟수 및 프로필 정보 반환용 DTO */

@Getter
@AllArgsConstructor
public class MemberStat {

    private String nickname; // 구성원 닉네임
    private Integer profileEmoji; // 이모지 번호
    private Integer profileBackground; // 배경색 번호
    private String customProfileImage; // 프로필 이미지 파일명
    private int count; // 해당 주 집안일 완료 횟수
}