package com.housewith.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.housewith.dto.photo.PhotoDetailResponse;
import com.housewith.dto.photo.PhotoSummaryResponse;
import com.housewith.dto.photo.PhotoUpdateRequest;
import com.housewith.dto.photo.PhotoUploadRequest;
import com.housewith.service.FileService;
import com.housewith.service.PhotoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/1224i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-21/1224i
 * 역할: 사진첩 도메인의 HTTP 엔드포인트 매핑 및 파일 업로드/조회 API 유효성 검증 담당 Controller */

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;
    private final FileService fileService;

    // 7_1 사진 업로드 (Multipart 파일과 메타데이터 동시 수신)
    @PostMapping
    public ResponseEntity<Long> uploadPhoto(
            @AuthenticationPrincipal Long userId,               // JWT 검증이 완료된 진짜 유저 PK
            @RequestHeader("ProfileId") Long profileId,         // FE와 맞춘 슬롯 PK 헤더 (안 맞을 시 하이브리드 단에서 직접 튜닝 가능)
            @RequestPart("metadata") @Valid PhotoUploadRequest request,
            @RequestPart("file") MultipartFile file) throws IOException{

        // 파일 유효성 검증 및 MultipartRequest 처리 흐름 확보
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 존재하지 않습니다.");
        }
        
        // 저장 경로 설정
        String uploadDir = "C:/HouseWith/uploads/photo/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs(); 
        }

    	String savedFileUrl = fileService.saveFile(file, "photo");
        
        // 경로에서 순수 파일명만 추출하여 DB에 넘기거나, URL 통째로 넘기는 건 기획에 맞춰 조율
        String savedFileName = savedFileUrl.substring(savedFileUrl.lastIndexOf("/") + 1);

        Long photoId = photoService.uploadPhoto(userId, profileId, request, savedFileName);
        return ResponseEntity.status(HttpStatus.CREATED).body(photoId);
    }

    // 7_2 사진 목록 조회 (앨범 이름 파라미터를 통한 동적 필터링)
    @GetMapping
    public ResponseEntity<List<PhotoSummaryResponse>> getPhotoSummaryList(
            @AuthenticationPrincipal Long userId,
            @RequestParam(value = "album", required = false) String albumName) {

        List<PhotoSummaryResponse> responses = photoService.getPhotoSummaryList(userId, albumName);
        return ResponseEntity.ok(responses); // 200 조회 성공
    }

    // 7_3 사진 단건 상세 조회
    @GetMapping("/{photoId}")
    public ResponseEntity<PhotoDetailResponse> getPhotoDetail(
            @PathVariable("photoId") Long photoId,
            @AuthenticationPrincipal Long userId) {

        PhotoDetailResponse response = photoService.getPhotoDetail(photoId, userId);
        return ResponseEntity.ok(response); // 200 조회 성공
    }

    // 7_4 대표 사진 설정 (더티 체킹 기반 상태 변경 연동)
    @PatchMapping("/{photoId}/thumbnail")
    public ResponseEntity<Void> setAlbumThumbnail(
            @PathVariable("photoId") Long photoId,
            @AuthenticationPrincipal Long userId) {

        photoService.setAlbumThumbnail(photoId, userId);
        return ResponseEntity.ok().build(); // 200 수정 성공
    }

    // 7_5 사진 삭제
    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            @PathVariable("photoId") Long photoId,
            @AuthenticationPrincipal Long userId) {

        photoService.deletePhoto(photoId, userId);
        return ResponseEntity.noContent().build(); // 204 바디 없음 성공
    }

    // 7_6 사진 정보 및 파일 수정 (PUT)
    @PutMapping("/{photoId}")
    public ResponseEntity<Void> updatePhoto(
            @PathVariable("photoId") Long photoId,
            @AuthenticationPrincipal Long userId, // 세션 토큰에서 유저 고유 ID 추출
            @Valid @ModelAttribute PhotoUpdateRequest request) throws IOException { 

        String newStoredFileName = null;

        if (request.getPhoto() != null && !request.getPhoto().isEmpty()) {
        	String savedFileUrl = fileService.saveFile(request.getPhoto(), "photo");
            newStoredFileName = savedFileUrl.substring(savedFileUrl.lastIndexOf("/") + 1);
        }

        photoService.updatePhoto(photoId, userId, request, newStoredFileName);
        return ResponseEntity.ok().build(); // 200 수정 성공 응답
    }
}