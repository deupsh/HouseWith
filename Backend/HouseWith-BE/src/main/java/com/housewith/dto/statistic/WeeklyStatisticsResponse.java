package com.housewith.dto.statistic;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1615i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1615i
 * 수정 내용: 
 * 역할: 주간 통계 조회 시 AI 코멘트, 통계 수치, 구성원별/카테고리별 분포 반환용 응답 DTO */

@Getter
@AllArgsConstructor
public class WeeklyStatisticsResponse {

    private String weekLabel;               // 주차 표시 라벨 | 예: "2026년 21주차"
    private String weekRange;               // 날짜 범위 표시 | 예: "2026.05.18 ~ 2026.05.24"

    // AI 코멘트
    private String participationComment;    // 가족 참여도 AI 코멘트
    private boolean isOverloaded;           // 부담 집중 여부| 40% 이상 집중 시 true
    private String overloadComment;         // 부담 집중 시 AI 문구 (isOverloaded=false 시 null)
    private String recommendComment;        // 개선 제안 or 긍정 AI 문구

    // 통계 수치
    private int totalCount;                 // 해당 주 총 집안일 횟수
    private double dailyAverage;            // 일 평균 집안일 횟수 | totalCount / 7
    private double participationRate;       // 완료율 | 완료된 집안일 / 전체 집안일

    // 시각화 데이터
    private List<MemberStat> memberStats; // 구성원별 참여도 목록
    private List<CategoryStat> categoryStats; // 집안일별 분포도 목록
}