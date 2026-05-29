package com.housewith.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 작성자: 박성현
 * 작성 시간: 2026-05-19/0915i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-29/1119i
 * 수정 내용: 허용 URL 추가 (에뮬레이터 및 로컬)
 * 역할: React 개발 서버(localhost:5173)와 CORS 정책 설정 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**") // 모든 API 경로에 적용
				.allowedOrigins("http://localhost:5173", "http://10.0.2.2:5173", "http://113.198.238.96:5173") // React 개발 서버
				.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS").allowedHeaders("*")
				.allowCredentials(true) // JWT 쿠키/헤더 허용
				.maxAge(3600); // preflight 캐시 1시간
	}
}