package com.housewith.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1619i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1619i
 * 수정 내용: 
 * 역할: 주간 통계에서 카테고리별 집안일 횟수 및 전체 대비 비율 반환용 DTO */

@Getter
@AllArgsConstructor
public class CategoryStat {

    private String categoryName; // 집안일 이름
    private int count; // 해당 카테고리 집안일 횟수
    private double percentage; // 전체 대비 비율 (예: 0.35 = 35%)
}