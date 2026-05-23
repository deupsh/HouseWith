package com.housewith.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/** 로 들어오는 모든 요청은 C:/HouseWith/uploads/ 안의 파일을 찾음
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///C:/HouseWith/uploads/");
    }
}