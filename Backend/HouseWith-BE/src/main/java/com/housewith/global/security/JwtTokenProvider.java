package com.housewith.global.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/1110i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-21/1110i
 * 역할: JWT 토큰 발급, 서명 검증, 페이로드(Claims) 추출 전담 컴포넌트 */

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long validityInMilliseconds;

    // 0.12.x 버전부터는 보안을 위해 javax.crypto.SecretKey 타입 지정을 권장
    private SecretKey key;

    @PostConstruct
    protected void init() {
        // application.properties에서 불러온 문자열 키를 HMAC-SHA 알고리즘용 객체로 변환
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // 1_1 로그인 성공 시 암호화된 진짜 JWT 토큰 생성 (0.12.5 빌더 문법 적용)
    public String createToken(Long userId, String groupName) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .subject(String.valueOf(userId))       // 기존 setSubject() -> subject() 변경
                .claim("groupName", groupName)         // 비즈니스용 커스텀 데이터 클레임 주입
                .issuedAt(now)                         // 기존 setIssuedAt() -> issuedAt() 변경
                .expiration(validity)                   // 기존 setExpiration() -> expiration() 변경
                .signWith(key)                         // 알고리즘 명시 없이 Key 객체만 넣으면 최적의 서명 자동 지정
                .compact();
    }

    // 토큰의 서명을 까서 유저 식별자(userId)를 꺼내는 로직 (0.12.5 Parser 문법 적용)
    public Long getUserId(String token) {
        String subject = Jwts.parser()
                .verifyWith(key)                       // 기존 setSigningKey() -> verifyWith() 변경
                .build()
                .parseSignedClaims(token)              // 기존 parseClaimsJws() -> parseSignedClaims() 변경
                .getPayload()                          // 기존 getBody() -> getPayload() 변경
                .getSubject();
        
        return Long.parseLong(subject);
    }

    // 토큰의 만료 시간 및 변조 여부를 깐깐하게 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token); // 복호화 및 서명 검증을 시도하여 예외가 터지지 않으면 유효함
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false; // 만료되거나 구조가 깨진 위조된 토큰일 경우 false 리턴
        }
    }
}