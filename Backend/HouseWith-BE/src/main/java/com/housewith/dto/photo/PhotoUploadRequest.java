package com.housewith.dto.photo;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1604i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-26/1741i
 * 수정 내용: MultipartFile 필드 제거 (컨트롤러에서 RequestPart로 별도 수신) → 이상적인 책임 분리→
 * 역할: 사진 업로드 요청 시 사진 파일, 제목, 날짜, 앨범 입력 및 유효성 검증용 DTO */

@Getter
@NoArgsConstructor
public class PhotoUploadRequest {

    @NotBlank(message = "사진 제목을 입력해주세요")
    @Size(min = 1, max = 20, message = "사진 제목은 1~20자여야 합니다")
    private String title; // 사진 제목

    private LocalDate date;                 // 사진 날짜 | 미 입력 시 Service에서 오늘 날짜 Default 처리

    private String album;                   // 앨범명 | 미 입력 시 Service에서 기본 앨범 Default 처리
}