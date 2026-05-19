package com.housewith.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/1606i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-19/1606i
 * 수정 내용: 
 * 역할: 사진 목록 조회 시 사진 기본 정보 및 대표 사진 여부 반환용 응답 DTO */

@Getter
@AllArgsConstructor
public class PhotoSummaryResponse {

    private Long photoId; // 사진 PK
    private String fileName; // 파일명
    private String title; // 사진 제목
    private LocalDate date; // 사진 날짜
    private boolean isThumbnail; // 앨범 대표 사진 여부
}