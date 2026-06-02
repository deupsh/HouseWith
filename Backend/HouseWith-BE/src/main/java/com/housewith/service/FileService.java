package com.housewith.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;

import lombok.RequiredArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-23/1725i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-06-01/1032i
 * 수정 내용: AWS 연동 버전으로 변경
 * 역할: 파일 관리 공통 Service */

@Service
@RequiredArgsConstructor // 핵심: S3Config에서 만든 AmazonS3Client를 주입받기 위해 꼭 필요
public class FileService {

    private final AmazonS3Client amazonS3Client;

    @Value("${cloud.aws.s3.bucket}") // application.properties에 적은 버킷 이름 가져오기
    private String bucket;
    
    @Value("${cloud.aws.cloudfront.url}")
    private String cloudFrontUrl;

    public String saveFile(MultipartFile file, String subDir) throws IOException {
        // 1. 파일명 중복 방지 (UUID 사용)
        String originalFilename = file.getOriginalFilename();
        String uuid = UUID.randomUUID().toString();

        // 2. S3에 저장될 객체 키 조합 (예: photo/uuid_풍경사진.jpg)
        // S3에서는 폴더라는 개념 대신 / 를 사용해 폴더처럼 보이게 함
        String s3FileName = subDir + "/" + uuid + "_" + originalFilename;

        // 3. 메타데이터 설정 (파일 크기 및 종류를 S3에 알려줌)
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        // 4. S3에 파일 업로드 (CannedAccessControlList.PublicRead 로 누구나 볼 수 있게 권한 부여)
        try (InputStream inputStream = file.getInputStream()) {
            amazonS3Client.putObject(new PutObjectRequest(bucket, s3FileName, inputStream, metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));
        }

        // 5. 가장 중요한 부분: 업로드된 사진의 "완벽한 인터넷 주소(URL)"를 반환합니다.
        // 예: https://housewith-bucket.s3.ap-northeast-2.amazonaws.com/photo/uuid_풍경사진.jpg
        return cloudFrontUrl + "/" + s3FileName;
    }
    
    // AWS S3 파일 물리적 삭제
    public void deleteFile(String fileUrl) {
        try {
            // DB에 저장된 fileUrl 예시: https://housewith-bucket.s3.ap-northeast-2.amazonaws.com/photo/uuid_사진.jpg
            // S3에서 파일을 지우려면 도메인 주소는 빼고 "photo/uuid_사진.jpg" 라는 '객체 키(Key)'만 알아야 함
        	String splitStr = ".cloudfront.net/";
            
            if (fileUrl != null && fileUrl.contains(splitStr)) {
                // ".amazonaws.com/" 문자열 이후의 값만 잘라서 추출
                String s3FileName = fileUrl.substring(fileUrl.indexOf(splitStr) + splitStr.length());
                
                // 추출한 키를 이용해 S3에서 해당 사진 완벽 삭제
                amazonS3Client.deleteObject(bucket, s3FileName);
            }
        } catch (Exception e) {
            System.err.println("S3 파일 물리적 삭제 실패: " + e.getMessage());
        }
    }
}