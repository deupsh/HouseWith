package com.housewith.dto.photo;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 작성자: 백승훈
 * 작성 시간: 2026-05-26/1132i
 * 마지막 수정자: 
 * 마지막 수정 시간:
 * 수정 내용: 
 * 역할: 사진 수정 요청 시 사진 제목, 날짜, 앨범 입력 및 유효성 검증용 DTO */

@Getter
@Setter
@NoArgsConstructor
public class PhotoUpdateRequest {

    private MultipartFile photo;  

    @NotBlank(message = "사진 제목을 입력해주세요")
    @Size(min = 1, max = 20, message = "사진 제목은 1~20자여야 합니다")
    private String title; // 사진 제목
    @PastOrPresent(message = "사진 날짜는 미래로 설정할 수 없습니다.")
    private LocalDate date;                 // 사진 날짜 | 미 입력 시 Service에서 오늘 날짜 Default 처리
    private String album;                   // 앨범명 | 미 입력 시 Service에서 기본 앨범 Default 처리
}