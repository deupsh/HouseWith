package com.housewith.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.housewith.dto.communication.AnswerCreateRequest;
import com.housewith.dto.communication.MoodCreateRequest;
import com.housewith.dto.communication.MoodResponse;
import com.housewith.dto.communication.QuestionResponse;
import com.housewith.service.CommunicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;

    // 오늘의 기분 작성
    @PostMapping("/moods")
    public ResponseEntity<Void> createMood(
            @AuthenticationPrincipal Long userId,
            @RequestHeader("X-Profile-Id") Long profileId, 
            @Valid @RequestBody MoodCreateRequest request) {
        
        communicationService.createMood(userId, profileId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 오늘의 가족 기분 조회
    @GetMapping("/moods")
    public ResponseEntity<List<MoodResponse>> getTodayMoods(@AuthenticationPrincipal Long userId) {
        List<MoodResponse> responses = communicationService.getTodayFamilyMoods(userId);
        return ResponseEntity.ok(responses);
    }

    // 질의응답 화면 조회
    @GetMapping("/questions")
    public ResponseEntity<QuestionResponse> getWeeklyQuestion(
            @AuthenticationPrincipal Long userId,
            @RequestHeader("X-Profile-Id") Long profileId) {
        
        QuestionResponse response = communicationService.getWeeklyQuestion(userId, profileId);
        return ResponseEntity.ok(response);
    }

    // 답변 제출
    @PostMapping("/questions/{questionId}/answer")
    public ResponseEntity<Void> submitAnswer(
            @PathVariable Long questionId,
            @RequestHeader("X-Profile-Id") Long profileId,
            @Valid @RequestBody AnswerCreateRequest request) {
        
        communicationService.submitAnswer(profileId, questionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}