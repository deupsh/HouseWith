package com.housewith.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** 작성자: 박성현
 * 작성 시간: 2026-05-23/1725i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-23/1725i
 * 수정 내용: 
 * 역할: 파일 관리 공통 Service */

@Service
public class FileService {

	public String saveFile(MultipartFile file, String subDir) throws IOException {
	    // 1. 저장할 경로 설정 (C:/HouseWith/uploads/profile 또는 /photo)
	    String baseDir = "C:/HouseWith/uploads";
	    Path uploadPath = Paths.get(baseDir, subDir);

	    // 폴더가 없으면 생성
	    if (!Files.exists(uploadPath)) {
	        Files.createDirectories(uploadPath);
	    }

	    // 2. 파일명 중복 방지 (UUID 사용)
	    String originalFilename = file.getOriginalFilename();
	    String uuid = UUID.randomUUID().toString();
	    String savedFileName = uuid + "_" + originalFilename;

	    // 3. 파일 저장
	    Path filePath = uploadPath.resolve(savedFileName);
	    file.transferTo(filePath.toFile());

	    // 4. DB에 저장할 경로 리턴 (예: "/profile/uuid_파일명.jpg")
	    // WebConfig 설정과 맞추기 위해 서브 디렉토리부터 시작하는 경로를 반환합니다.
	    return "/" + subDir + "/" + savedFileName;
	}
}