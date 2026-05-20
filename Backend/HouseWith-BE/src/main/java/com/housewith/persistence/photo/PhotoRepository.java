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
	Optional<Photo> findByUser_IdAndAlbumNameAndIsRepresentativeTrue(Long userId, String albumName);

	// 3_2 앨범 목록 조회: 유저가 가진 모든 앨범 이름들을 중복 없이 가져오기 (필요 시 @Query 사용)
	@Query("SELECT DISTINCT p.albumName FROM Photo p WHERE p.user.id = :userId")
	List<String> findDistinctAlbumNamesByUserId(@Param("userId") Long userId);

	// 3_3 사진 정렬: 특정 앨범의 사진들을 날짜 최신순(Desc)으로 모두 가져오기
	List<Photo> findByUser_IdAndAlbumNameOrderByPhotoDateDesc(Long userId, String albumName);
}