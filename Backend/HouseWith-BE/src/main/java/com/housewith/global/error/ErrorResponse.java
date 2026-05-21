package com.housewith.global.error;

import java.time.LocalDateTime;

import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/1015i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-21/1015i
 * 역할: 프론트엔드와 통신하기 위한 '공통 에러 응답 규격(포맷)'을 정의하는 DTO */

@Getter
public class ErrorResponse {
    private final LocalDateTime timestamp; // 에러 발생 시간
    private final int status; // HTTP 상태 숫자 코드 (예: 400, 401, 404, 500 등)
    private final String error; // 발생한 에러 종류 및 HTTP 상태 코드명 (예: Bad Request, Not Found, Conflict)
    private final String message; // 발생한 에러의 구체적인 원인 및 프론트엔드 사용자에게 보여줄 안내 메시지 (예: 이미 가입된 이메일입니다.)

    public ErrorResponse(int status, String error, String message) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
    }
}