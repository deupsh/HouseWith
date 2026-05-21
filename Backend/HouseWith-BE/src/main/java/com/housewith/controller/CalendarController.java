package com.housewith.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.housewith.dto.schedule.CalendarCreateRequest;
import com.housewith.dto.schedule.CalendarDetailResponse;
import com.housewith.dto.schedule.CalendarSummaryResponse;
import com.housewith.dto.schedule.CalendarUpdateRequest;
import com.housewith.service.CalendarService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/1005i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-21/1155i
 * 수정 내용: MockJWT → JWT 토큰 발급으로 코드 수정→
 * 역할: 캘린더 도메인의 HTTP 엔드포인트 매핑 및 유효성 검증 담당 Controller */

@RestController
@RequestMapping("/api/calendars")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    // 5_1 일정 등록 (POST /api/calendars)
    @PostMapping
    public ResponseEntity<Long> createCalendar(
            @AuthenticationPrincipal Long userId,             // JWT 토큰에서 추출된 안전한 PK 바인딩
            @RequestHeader("X-Profile-Id") Long profileId,    // 현재 접속 중인 슬롯 PK
            @Valid @RequestBody CalendarCreateRequest request) {
        
        Long calendarId = calendarService.createCalendar(userId, profileId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(calendarId); // 201 생성 성공
    }

    // 5_2 일정 수정 (PUT /api/calendars/{calendarId})
    @PutMapping("/{calendarId}")
    public ResponseEntity<Void> updateCalendar(
            @PathVariable("calendarId") Long calendarId,
            @Valid @RequestBody CalendarUpdateRequest request) {
        
        calendarService.updateCalendar(calendarId, request);
        return ResponseEntity.ok().build(); // 200 수정 성공
    }

    // 5_3 달력 기본 조회 (GET /api/calendars?year=2026&month=5)
    @GetMapping
    public ResponseEntity<List<CalendarSummaryResponse>> getCalendarSummary(
            @AuthenticationPrincipal Long userId,             // JWT 토큰에서 추출된 안전한 PK 바인딩
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        
        List<CalendarSummaryResponse> responses = calendarService.getCalendarSummary(userId, year, month);
        return ResponseEntity.ok(responses); // 200 조회 성공
    }

    // 5_4 일정 상세 조회 (GET /api/calendars/{calendarId})
    @GetMapping("/{calendarId}")
    public ResponseEntity<CalendarDetailResponse> getCalendarDetail(
            @PathVariable("calendarId") Long calendarId,
            @AuthenticationPrincipal Long userId) {           // JWT 토큰에서 추출된 안전한 PK 바인딩
        
        CalendarDetailResponse response = calendarService.getCalendarDetail(calendarId, userId);
        return ResponseEntity.ok(response); // 200 조회 성공
    }

    // 5_5 일정 삭제 (DELETE /api/calendars/{calendarId})
    @DeleteMapping("/{calendarId}")
    public ResponseEntity<Void> deleteCalendar(@PathVariable("calendarId") Long calendarId) {
        calendarService.deleteCalendar(calendarId);
        return ResponseEntity.noContent().build(); // 204 바디 없음 성공
    }
}