package com.housewith.global.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/1015i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-21/1235i
 * 수정 내용: API 규격 위반 예외 추가
 * 역할: 비즈니스 로직 예외 및 Spring API 바인딩 예외를 FE에 명확히 전달하는 전역 에러 핸들러 */

@RestControllerAdvice
public class GlobalExceptionHandler {

    /* =========================================================
     * 1. 비즈니스 로직 예외 (Service 계층)
     * ========================================================= */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e) {
        String message = e.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST;

        // 공통 키워드를 통한 상태 코드 자동 분류
        if (message.contains("존재하지")) {
            status = HttpStatus.NOT_FOUND; // 404
        } else if (message.contains("비밀번호가 일치하지 않습니다") || message.contains("이메일입니다")) {
            status = HttpStatus.UNAUTHORIZED; // 401
        } else if (message.contains("권한이 없습니다")) {
            status = HttpStatus.FORBIDDEN; // 403 (권한 방어용)
        }

        ErrorResponse response = new ErrorResponse(status.value(), status.getReasonPhrase(), message);
        return new ResponseEntity<>(response, status);
    }
    
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(IllegalStateException e) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                e.getMessage() // ex) "가족 슬롯은 최대 10개까지만 생성할 수 있습니다." 메시지 전달
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /* =========================================================
     * 2. API 규격 위반 예외 (파라미터나 헤더를 잘못 보냈을 때 - 400 방어)
     * ========================================================= */
    
    // 2-1. @Valid 유효성 검사 실패 (DTO 필드 에러)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String errorMessage = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                errorMessage != null ? errorMessage : "입력값이 올바르지 않습니다."
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // 2-2. 필수 @RequestHeader 누락 (HeaderException, 컬럼)
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> handleMissingHeaderException(MissingRequestHeaderException e) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "필수 헤더가 누락되었습니다: " + e.getHeaderName()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // 2-3. 필수 @RequestPart 누락 (PartException, MultiFile)
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponse> handleMissingPartException(MissingServletRequestPartException e) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "필수 파일 또는 데이터가 누락되었습니다: " + e.getRequestPartName()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /* =========================================================
     * 3. 예상치 못한 서버 내부 에러 - 500
     * ========================================================= */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception e) {
        e.printStackTrace(); 
        
        ErrorResponse response = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "서버 내부 오류가 발생했습니다."
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}