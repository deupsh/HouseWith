package com.housewith.global.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/1135i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간: 2026-05-21/1135i
 * 역할: 스프링 시큐리티 전역 환경 설정 및 JWT 검증 필터 배치, API 인증/인가 라우팅 정의, CORS 설정 */

@Configuration
@EnableWebSecurity // 스프링 시큐리티 필터 체인을 활성화하기 위해 필수 추가
@RequiredArgsConstructor
public class SecurityConfig {

    // 문지기 필터에 전달할 토큰 검증 컴포넌트 주입
    private final JwtTokenProvider jwtTokenProvider;

    // 암호화 Bean 설정
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    // JWT 기반의 무상태(Stateless) 인프라 구축을 위한 보안 필터 체인 주입
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 🚨 1. CORS 설정 활성화 (아래 정의한 corsConfigurationSource 규칙을 따름)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // REST API 규격에 맞춰 불필요한 기본 서블릿 폼 및 베이직 인증 끄기
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            
            // 대규모 세션 관리를 배제하고 완전히 무상태(Stateless)하게 토큰으로만 제어하도록 선언
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // API 명세서에 약속된 비인증/인증 영역 진입로 차단선 설정
            .authorizeHttpRequests(auth -> auth
                // OPTIONS 요청(Preflight)은 무조건 허용 (CORS 에러 방지용)
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                // 회원가입, 로그인, 이메일 체크 등은 토큰 없이 무조건 진입 허용
                .requestMatchers("/api/auth/**").permitAll()
                // 캘린더, 슬롯 등 나머지 모든 비즈니스 API는 무조건 유효한 JWT 토큰 소지 필수
                .anyRequest().authenticated()
            )
            
            // JwtAuthenticationFilter 문지기를 시큐리티 기본 인증 필터 바로 앞에 강제 배치
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 🚨 2. 프론트엔드(Vercel) 통신을 위한 CORS 상세 규칙 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Vercel 프론트엔드 주소만 정확히 허용
        configuration.setAllowedOrigins(List.of("https://housewith.vercel.app")); 
        // 사용할 수 있는 HTTP 메서드 전부 허용
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        // 모든 헤더 허용
        configuration.setAllowedHeaders(List.of("*"));
        // 내장된 쿠키나 JWT 인증 정보(Authorization 헤더)를 포함한 통신 허용
        configuration.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}