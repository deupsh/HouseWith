package com.housewith.controller;

import com.housewith.dto.account.LoginResponse;
import com.housewith.dto.account.SlotItem;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** 작성자:
 * 작성 시간:
 * 마지막 수정자:
 * 마지막 수정 시간:
 * 수정 내용:
 * 역할: FE-BE 통신 및 CORS 설정 확인용 Mock 컨트롤러 */

@RestController
@RequestMapping("/api/mock")
public class MockController {

    @GetMapping("/login")
    public ResponseEntity<LoginResponse> mockLogin() {

        List<SlotItem> slots = List.of(
                new SlotItem(1L, "엄마", "3", 2, null),
                new SlotItem(2L, "아빠", "5", 1, null),
                new SlotItem(3L, "딸", "7", 4, "profile.jpg")
        );

        LoginResponse response = new LoginResponse(
                "mock.jwt.token",
                "Bearer",
                1L,
                "우리가족",
                slots
        );

        return ResponseEntity.ok(response);
    }
}