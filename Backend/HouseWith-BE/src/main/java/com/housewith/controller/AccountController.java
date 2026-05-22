package com.housewith.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.housewith.dto.account.EmailCheckRequest;
import com.housewith.dto.account.LoginRequest;
import com.housewith.dto.account.LoginResponse;
import com.housewith.dto.account.PasswordVerifyRequest;
import com.housewith.dto.account.SlotCreateRequest;
import com.housewith.dto.account.SlotItem;
import com.housewith.dto.account.SlotLoginRequest;
import com.housewith.dto.account.SlotLoginResponse;
import com.housewith.dto.account.SlotPinUpdateRequest;
import com.housewith.dto.account.SlotUpdateRequest;
import com.housewith.dto.account.UserCreateRequest;
import com.housewith.service.AccountService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** 작성자: 백승훈
 * 작성 시간: 2026-05-21
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-12/1430i
 * 수정 내용: 가족 구성원 반환 시 PK만 반환 → SlotItem DTO 반환 (박성현 - 2026-05-12/1430i) 
 * 역할: 회원 가입 시 이메일 중복 확인용 DTO */

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AccountController {
    
    private final AccountService accountService;
    
    // 이메일 중복 검사
    @PostMapping("/auth/check-email")
    public ResponseEntity<Void> checkEmail(@Valid @RequestBody EmailCheckRequest request) {
        boolean isDuplicate = accountService.checkEmailDuplicate(request);
        if (isDuplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 이미 존재하면 409 Conflict
        }
        return ResponseEntity.ok().build(); // 사용 가능하면 200 OK
    }

    // 회원 가입
    @PostMapping("/auth/register")
    public ResponseEntity<Long> register(@Valid @RequestBody UserCreateRequest request) {
        Long userId = accountService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userId); // 생성 성공 201 Created
    }

    // 로그인 및 슬롯 목록 조회
    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = accountService.login(request);
        return ResponseEntity.ok(response); // 200 OK와 함께 복합 DTO 반환
    }

    // 가족 구성원 슬롯 생성
    @PostMapping(value = "/slots", consumes = "multipart/form-data")
    public ResponseEntity<SlotItem> createSlot(
            @AuthenticationPrincipal Long userId, 
            @Valid @ModelAttribute SlotCreateRequest request) {
        
        // 이미지 파일 처리
        String uploadedImageUrl = null;
        MultipartFile file = request.getProfileImage();
        if (file != null && !file.isEmpty()) {
            uploadedImageUrl = "https://housewith-s3-bucket.s3.amazonaws.com/profiles/" + file.getOriginalFilename();
        }

        SlotItem createSlot = accountService.createSlot(userId, request, uploadedImageUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(createSlot); // 201 Created
    }

    // 가족 슬롯 접속
    @PostMapping("/slots/login")
    public ResponseEntity<SlotLoginResponse> loginSlot(@Valid @RequestBody SlotLoginRequest request) {
        SlotLoginResponse response = accountService.loginSlot(request);
        return ResponseEntity.ok(response);
    }

    // 가족 프로필 정보 수정
    @PutMapping(value = "/slots/{slotId}", consumes = "multipart/form-data")
    public ResponseEntity<Void> updateSlot(
            @PathVariable Long slotId,
            @AuthenticationPrincipal Long userId,
            @Valid @ModelAttribute SlotUpdateRequest request) {
        
        String updatedImageUrl = null;
        MultipartFile file = request.getProfileImage();
        if (file != null && !file.isEmpty()) {
            updatedImageUrl = "https://housewith-s3-bucket.s3.amazonaws.com/profiles/" + file.getOriginalFilename();
        }

        accountService.updateSlot(slotId, userId, request, updatedImageUrl);
        return ResponseEntity.ok().build();
    }

    // 가족 계정 비밀번호 검증 (PIN 수정 진입 전 1차 확인)
    @PostMapping("/auth/verify-password")
    public ResponseEntity<Void> verifyPassword(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody PasswordVerifyRequest request) {

        accountService.verifyAccountPassword(userId, request.getPassword());
        return ResponseEntity.ok().build();
    }

    // 슬롯 PIN 번호 변경 및 해제
    @PatchMapping("/slots/{slotId}/pin")
    public ResponseEntity<Void> updateSlotPin(
            @PathVariable("slotId") Long slotId,
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody SlotPinUpdateRequest request) {

        accountService.updateSlotPin(slotId, userId, request);
        return ResponseEntity.ok().build();
    }
    
    // 슬롯 삭제 (DELETE /api/slots/{slotId})
    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable("slotId") Long slotId,
            @AuthenticationPrincipal Long userId) {

        accountService.deleteSlot(slotId, userId);
        return ResponseEntity.noContent().build(); // 204 바디 없음 성공
    }

    // 회원 탈퇴 (DELETE /api/auth/withdraw)
    @DeleteMapping("/auth/withdraw")
    public ResponseEntity<Void> withdrawUser(
            @AuthenticationPrincipal Long userId) {

        accountService.withdrawUser(userId);
        return ResponseEntity.noContent().build(); // 204 바디 없음 성공
    }
}