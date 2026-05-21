package com.housewith.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ModelAttribute;
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
import com.housewith.dto.account.SlotCreateRequest;
import com.housewith.dto.account.SlotLoginRequest;
import com.housewith.dto.account.SlotLoginResponse;
import com.housewith.dto.account.SlotUpdateRequest;
import com.housewith.dto.account.UserCreateRequest;
import com.housewith.service.AccountService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

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
    public ResponseEntity<Long> createSlot(
            @AuthenticationPrincipal Long userId, 
            @Valid @ModelAttribute SlotCreateRequest request) {
        
        // 이미지 파일 처리
        String uploadedImageUrl = null;
        MultipartFile file = request.getProfileImage();
        if (file != null && !file.isEmpty()) {
            uploadedImageUrl = "https://housewith-s3-bucket.s3.amazonaws.com/profiles/" + file.getOriginalFilename();
        }

        Long slotId = accountService.createSlot(userId, request, uploadedImageUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(slotId); // 201 Created
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
            @Valid @ModelAttribute SlotUpdateRequest request) {
        
        String updatedImageUrl = null;
        MultipartFile file = request.getProfileImage();
        if (file != null && !file.isEmpty()) {
            updatedImageUrl = "https://housewith-s3-bucket.s3.amazonaws.com/profiles/" + file.getOriginalFilename();
        }

        accountService.updateSlot(slotId, request, updatedImageUrl);
        return ResponseEntity.ok().build();
    }
    
}
