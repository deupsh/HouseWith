package com.housewith.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.housewith.domain.photo.Album;
import com.housewith.persistence.photo.AlbumRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlbumService {

    private final AlbumRepository albumRepository;

    public List<String> getUserAlbumNames(Long userId) {
        // 앞서 만들어둔 앨범 전체 조회 Repository 메서드 사용
        List<Album> albums = albumRepository.findByUser_IdOrderByCreatedAtAsc(userId);
        
        // 프론트엔드가 편하게 쓸 수 있도록 이름(String)만 쏙쏙 뽑아서 리스트로 반환
        return albums.stream()
                .map(Album::getName)
                .toList();
    }
}