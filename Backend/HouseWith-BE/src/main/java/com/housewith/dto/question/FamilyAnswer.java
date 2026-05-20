package com.housewith.dto.question;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1450i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1712i
 * 수정 내용: Integer profileEmoji → String profileEmoji
 * 역할: 주간 질의응답 화면에서 가족 구성원별 답변 정보 반환용 DTO */

@Getter
@AllArgsConstructor
public class FamilyAnswer {

    private String nickname; // 답변한 슬롯 닉네임
    private String profileEmoji; // 이모지 번호
    private Integer profileBackground; // 배경 번호
    private String customProfileImage; // 프로필 이미지 파일명
    private String content; // 가족 구성원의 답변 내용
}