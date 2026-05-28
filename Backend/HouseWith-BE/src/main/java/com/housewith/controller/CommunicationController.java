package com.housewith.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.housewith.dto.communication.AnswerCreateRequest;
import com.housewith.dto.communication.MoodCreateRequest;
import com.housewith.dto.communication.MoodResponse;
import com.housewith.dto.communication.QuestionResponse;
import com.housewith.service.CommunicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

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
    public ResponseEntity<?> getWeeklyQuestion(
            @AuthenticationPrincipal Long userId,
            @RequestHeader("X-Profile-Id") Long profileId,
            @RequestParam(name = "offset", defaultValue = "0") int offset) {
        
    	try {
            QuestionResponse response = communicationService.getWeeklyQuestion(userId, profileId, offset);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            // 🚨 500 에러 대신 404와 함께 "현재 활성화된 주간 질문이 없습니다." 메시지 반환
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 답변 제출
    @PostMapping("/questions/{questionId}/answers")
    public ResponseEntity<Void> submitAnswer(
    		@PathVariable("questionId") Long questionId,
    		@AuthenticationPrincipal Long userId,
            @RequestHeader("X-Profile-Id") Long profileId,
            @Valid @RequestBody AnswerCreateRequest request) {
        
    	communicationService.submitAnswer(userId, profileId, questionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
    @PatchMapping("/questions/settings")
    public ResponseEntity<Void> updateQuestionSettings(
            @AuthenticationPrincipal Long userId,
            @RequestBody com.housewith.dto.communication.QuestionSettingRequest request) {
        
        // 프론트에서 넘어온 true/false 값을 서비스 로직으로 전달
        communicationService.updateQuestionSetting(userId, request.getIsReceivingQuestion());
        
        return ResponseEntity.ok().build();
    }
}