package com.housewith.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.housewith.domain.account.Profile;
import com.housewith.domain.account.User;
import com.housewith.domain.photo.Album;
import com.housewith.domain.photo.Photo;
import com.housewith.dto.photo.PhotoDetailResponse;
import com.housewith.dto.photo.PhotoSummaryResponse;
import com.housewith.dto.photo.PhotoUpdateRequest;
import com.housewith.dto.photo.PhotoUploadRequest;
import com.housewith.persistence.account.ProfileRepository;
import com.housewith.persistence.account.UserRepository;
import com.housewith.persistence.photo.AlbumRepository;
import com.housewith.persistence.photo.PhotoRepository;

import lombok.RequiredArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/1220i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-21/1220i
 * 역할: 사진첩 비즈니스 로직 담당 Service */

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AlbumRepository albumRepository;

    // 7_1 사진 업로드
    @Transactional
    public Long uploadPhoto(Long userId, Long profileId, PhotoUploadRequest request, String storedFileName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 가족 계정입니다."));

        // 연관관계 매핑을 위해 DB에서 Profile 엔티티 전체를 조회
        Profile uploader = profileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필 슬롯입니다."));

        LocalDate finalDate = (request.getDate() != null) ? request.getDate() : LocalDate.now();
        Album album = getOrCreateAlbum(user, request.getAlbum());
        
        Photo photo = Photo.builder()
                .user(user)
                .title(request.getTitle())
                .photoDate(finalDate)
                .album(album)
                .uploadedBy(uploader) // Long 타입 ID가 아닌 Profile 객체 통째로 주입
                .fileName(storedFileName)
                .isRepresentative(false)
                .build();

        return photoRepository.save(photo).getId();
    }

    // 7_2 앨범별 사진 목록 조회
    public List<PhotoSummaryResponse> getPhotoSummaryList(Long userId, String albumName) {
        List<Photo> photos;
        
        // 올바른 흐름: 파라미터가 비어있거나 '전체 보기'면 유저의 전체 사진 조회, 값이 있으면 해당 앨범만 조회
        if (albumName == null || albumName.isBlank() || albumName.equals("전체 보기")) {
            photos = photoRepository.findByUser_IdOrderByPhotoDateDesc(userId);
        } else {
        	photos = photoRepository.findByUser_IdAndAlbum_NameOrderByPhotoDateDesc(userId, albumName);
        }

        return photos.stream()
                .map(p -> new PhotoSummaryResponse(
                        p.getId(),
                        p.getFileName(),
                        p.getTitle(),
                        p.getPhotoDate(),
                        p.getAlbum().getName(),
                        p.getIsRepresentative()
                ))
                .toList();
    }

    // 7_3 사진 단건 상세 조회
    public PhotoDetailResponse getPhotoDetail(Long photoId, Long userId) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사진입니다."));

        // 무결성 방어: 다른 가족의 사진 조회 차단
        if (!photo.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("해당 사진에 대한 접근 권한이 없습니다.");
        }

        // 지연 로딩(LAZY)된 Profile 객체를 탐색하여 닉네임 추출
        String uploaderNickname = photo.getUploadedBy().getNickname();

        return new PhotoDetailResponse(
                photo.getId(),
                photo.getFileName(),
                photo.getTitle(),
                photo.getPhotoDate(),
                photo.getAlbum().getName(),
                uploaderNickname,
                photo.getIsRepresentative()
        );
    }

    // 7_4 대표 사진 설정
    @Transactional
    public void setAlbumThumbnail(Long photoId, Long userId) {
        Photo targetPhoto = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사진입니다."));

        if (!targetPhoto.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("해당 사진에 대한 접근 권한이 없습니다.");
        }

        // 기존에 해당 앨범의 대표 사진이었던 레코드 조회 후 해제
        photoRepository.findByUser_IdAndAlbum_NameAndIsRepresentativeTrue(userId, targetPhoto.getAlbum().getName())
                .ifPresent(existing -> {
                    existing.changeRepresentativeStatus(false);
                });

        // 새 사진을 대표 사진으로 설정
        targetPhoto.changeRepresentativeStatus(true);
    }

    // 7_5 사진 삭제
    @Transactional
    public void deletePhoto(Long photoId, Long userId) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사진입니다."));

        if (!photo.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("해당 사진에 대한 접근 권한이 없습니다.");
        }

        // 1. 지우기 전에 앨범 객체를 미리 저장해 둡니다.
        Album targetAlbum = photo.getAlbum();
        String fileName = photo.getFileName();

        // 2. 사진 삭제 실행
        photoRepository.delete(photo);

        // 3. 가비지 컬렉션: 해당 앨범에 남은 사진이 있는지 카운트해서 0장이면 앨범도 삭제!
        // (단, "기본 앨범"은 사진이 없어도 영구 유지하고 싶다면 예외 처리 추가)
        long remainingPhotos = photoRepository.countByAlbum_Id(targetAlbum.getId());
        
        if (remainingPhotos == 0 && !targetAlbum.getName().equals("기본 앨범")) {
            albumRepository.delete(targetAlbum);
        }
        try {
            Path filePath = Paths.get("C:/HouseWith/uploads/photo", fileName); 
            
            // 파일이 존재하면 깔끔하게 삭제
            Files.deleteIfExists(filePath); 
        } catch (IOException e) {
            // DB 롤백 방지용: 파일 삭제에 실패하더라도 DB 레코드 삭제는 유지되도록 로그만 남깁니다.
            System.err.println("물리적 파일 삭제 실패: " + fileName);
            e.printStackTrace();
        }
    }

    // 7_6 사진 정보 및 파일 수정 로직
    @Transactional
    public void updatePhoto(Long photoId, Long userId, PhotoUpdateRequest request, String newStoredFileName) {
        // 1. 수정할 대상 원본 사진 조회
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사진입니다."));

        // 2. 권한 방어 체크 (기존 다른 메서드들과 동일한 구조 유지)
        if (!photo.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("해당 사진에 대한 접근 권한이 없습니다.");
        }

        // 파일 저장 처리는 컨트롤러 단에서 실행하여 새로운 파일명(newStoredFileName)을 넘겨받거나,
        // 서비스 내부에서 처리할 경우 기존 파일을 지우는 유틸 로직을 이곳에 구성합니다.
        // 예: if (newStoredFileName != null) { fileUtil.delete(photo.getFileName()); }
        
        Album targetAlbum = getOrCreateAlbum(photo.getUser(), request.getAlbum());

        // 3. Setter를 쓰지 않고 도메인 엔티티 비즈니스 메서드 호출 (더티 체킹 발동)
        photo.updatePhotoInfo(
                request.getTitle(),
                request.getDate(),
                targetAlbum,
                newStoredFileName // 파일 업로드가 없다면 null이 전달되어 기존 fileName 유지됨
        );
    }
    
    // 앨범 Find or Create 헬퍼 메소드
    private Album getOrCreateAlbum(User user, String albumName) {
        String targetName = (albumName == null || albumName.isBlank()) ? "기본 앨범" : albumName;
        
        return albumRepository.findByUser_IdAndName(user.getId(), targetName)
                .orElseGet(() -> {
                    // DB에 앨범이 없으면 새 앨범을 생성해서 즉시 저장 후 반환!
                    Album newAlbum = Album.builder().user(user).name(targetName).build();
                    return albumRepository.save(newAlbum);
                });
    }
}