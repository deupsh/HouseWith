package com.housewith.global.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/1115i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-21/1115i
 * 역할: 모든 HTTP 요청이 컨트롤러에 닿기 전에 가로채서 JWT 토큰의 유효성을 검사하는 전역 보안 필터 */

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. HTTP 요청 헤더에서 "Authorization" 값을 통째로 꺼냄
        String bearerToken = request.getHeader("Authorization");
        String token = null;

        // 2. 값이 존재하고, 명세서의 약속대로 "Bearer "로 시작한다면 실제 토큰 부분만 잘라냄
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            token = bearerToken.substring(7);
        }

        // 3. 토큰이 존재하고, 검증 도구(Provider)를 통과했다면 (위조/만료되지 않았다면)
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // 토큰 내부에서 유저 PK를 안전하게 추출
            Long userId = jwtTokenProvider.getUserId(token);
            
            // 추출한 PK를 바탕으로 스프링 시큐리티의 공식 인증 객체(Authentication) 생성
            // 세 번째 파라미터는 권한(Role) 목록인데, 현재 서비스는 단일 유저 권한이므로 빈 리스트로 둡니다.
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, List.of());
            
            // 4. 생성된 인증 객체를 시큐리티 전역 컨텍스트에 꽂아 넣음 (이제 Controller에서 꺼내 쓸 수 있음!)
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 5. 검증이 끝났으니 다음 필터나 목적지(Controller)로 요청을 그대로 통과시킴
        filterChain.doFilter(request, response);
    }
}