package com.housewith.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.housewith.service.AlbumService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService albumService;

    // 앨범 탭 렌더링을 위한 유저의 전체 앨범명 목록 조회
    @GetMapping
    public ResponseEntity<List<String>> getUserAlbums(@AuthenticationPrincipal Long userId) {
        List<String> albums = albumService.getUserAlbumNames(userId);
        return ResponseEntity.ok(albums);
    }
}