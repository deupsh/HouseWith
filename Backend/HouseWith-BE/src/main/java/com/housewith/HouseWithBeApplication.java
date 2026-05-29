package com.housewith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing // 데이터 생성, 수정일시 자동 기록
@EnableScheduling // 스케줄러 기능 활성화
public class HouseWithBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(HouseWithBeApplication.class, args);
	}

}
