package com.housewith.persistence.photo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.housewith.domain.photo.Photo;

/** 작성자: 박성현
 * 작성 시간: 2026-05-20/1012i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1012i
 * 수정 내용: 
 * 역할: 사진첩 도메인의 사진 데이터 영속성 관리 및 앨범별 정렬/대표 사진 조회 */

public interface PhotoRepository extends JpaRepository<Photo, Long> {
	// 3_2 대표 사진 조회: 특정 앨범의 대표 사진(isRepresentative = true) 가져오기
	Optional<Photo> findByUser_IdAndAlbum_NameAndIsRepresentativeTrue(Long userId, String albumName);

	// 3_3 사진 정렬: 특정 앨범의 사진들을 날짜 최신순(Desc)으로 모두 가져오기
	List<Photo> findByUser_IdAndAlbum_NameOrderByPhotoDateDesc(Long userId, String albumName);
	
	// 앨범 무관 전체 사진 가져오기
	List<Photo> findByUser_IdOrderByPhotoDateDesc(Long userId);
	
	// 앨범 내 남은 사진 개수 확인
	long countByAlbum_Id(Long albumId);
}