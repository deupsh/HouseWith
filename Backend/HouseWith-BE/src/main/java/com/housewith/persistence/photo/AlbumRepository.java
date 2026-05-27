package com.housewith.persistence.photo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.housewith.domain.photo.Album;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    // Find or Create를 위해 유저와 앨범 이름으로 기존 앨범을 찾는 메서드
    Optional<Album> findByUser_IdAndName(Long userId, String name);
    
    // 특정 유저(가족)가 가진 모든 앨범 목록을 생성순으로 정렬해서 가져오는 메서드
    List<Album> findByUser_IdOrderByCreatedAtAsc(Long userId);
}