package com.housewith.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 작성자: 박성현
 * 작성 시간: 2026-05-23/1824i
 * 마지막 수정자:
 * 마지막 수정 시간:
 * 역할: 업로드된 실제 파일(C:/HouseWith/uploads/)을 웹 URL(/uploads/**)로 접근할 수 있도록 정적 리소스 경로 매핑 */

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/** 로 들어오는 모든 요청은 C:/HouseWith/uploads/ 안의 파일을 찾음
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///C:/HouseWith/uploads/");
    }
}