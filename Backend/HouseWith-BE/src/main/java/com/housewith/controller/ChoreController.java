package com.housewith.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.housewith.dto.chore.ChoreCreateRequest;
import com.housewith.dto.chore.ChoreResponse;
import com.housewith.dto.chore.ChoreUpdateRequest;
import com.housewith.service.ChoreService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chores")
@RequiredArgsConstructor
public class ChoreController {
    
    private final ChoreService choreService;
    
    // 집안일 등록
    @PostMapping
    public ResponseEntity<Void> createChore(
            @AuthenticationPrincipal Long userId,
            @RequestHeader("X-Profile-Id") Long profileId,
            @Valid @RequestBody ChoreCreateRequest request) {
        
        choreService.createChore(userId, profileId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    // 집안일 수정
    @PutMapping("/{choreId}")
    public ResponseEntity<Void> updateChore(
            @PathVariable Long choreId,
            @Valid @RequestBody ChoreUpdateRequest request) {
        
        choreService.updateChore(choreId, request);
        return ResponseEntity.ok().build();
    }

    // 집안일 목록 조회
    @GetMapping
    public ResponseEntity<List<ChoreResponse>> getChores(
            @AuthenticationPrincipal Long userId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<ChoreResponse> responses = choreService.getChoreByDate(userId, date);
        return ResponseEntity.ok(responses);
    }

    // 집안일 완료 처리 (토글)
    @PatchMapping("/{choreId}/done")
    public ResponseEntity<Void> toggleChoreDone(
            @PathVariable Long choreId,
            @RequestHeader("X-Profile-Id") Long profileId) {
        
        LocalDate today = LocalDate.now(); 
        choreService.toggleChoreComplete(choreId, profileId, today);
        return ResponseEntity.ok().build();
    }

    // 집안일 삭제
    @DeleteMapping("/{choreId}")
    public ResponseEntity<Void> deleteChore(@PathVariable Long choreId) {
        choreService.deleteChore(choreId);
        return ResponseEntity.noContent().build(); 
    }
}
