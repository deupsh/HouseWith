package com.housewith.global.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/1015i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-21/1015i
 * 역할: 애플리케이션 전역(모든 Controller)에서 발생하는 예외(Exception)를 중간에서 가로채어 정의한 규격에 맞는 에러를 FE에 전달 */

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 Bad Request 및 비즈니스 예외 처리 분기
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e) {
        String message = e.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST;

		// 공통 키워드를 통한 404 (Not Found) 자동 분류
		if (message.contains("존재하지 않는")) {
			status = HttpStatus.NOT_FOUND;
		}
		// 인증 관련 에러 분류
		else if (message.contains("비밀번호가 일치하지 않습니다") || message.contains("이메일입니다")) {
			status = HttpStatus.UNAUTHORIZED; 
        }

        ErrorResponse response = new ErrorResponse(status.value(), status.getReasonPhrase(), message);
        return new ResponseEntity<>(response, status);
    }

    // 500 서버 내부 오류 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception e) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요."
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}