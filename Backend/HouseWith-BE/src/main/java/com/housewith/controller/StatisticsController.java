package com.housewith.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.housewith.dto.statistic.WeeklyStatisticsResponse;
import com.housewith.service.StatisticsService;

import lombok.RequiredArgsConstructor;

/** 작성자: 백승훈
 * 작성 시간: 2026-05-22/1043i
 * 마지막 수정자: 
 * 마지막 수정 시간: 
 * 역할: 주간 통계 조회 Controller */

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    // 9_1 주간 통계 조회 (명세서 기준 9_1)
    @GetMapping
    public ResponseEntity<WeeklyStatisticsResponse> getWeeklyStatistics(
            @AuthenticationPrincipal Long userId,
            @RequestParam(name = "week", required = false) String week) {
        
        // week 파라미터가 없으면 내부적으로 현재 주차를 기준으로 계산합니다.
        WeeklyStatisticsResponse response = statisticsService.getWeeklyStatistics(userId, week);
        return ResponseEntity.ok(response);
    }
}