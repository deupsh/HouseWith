package com.housewith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HouseWithBeApplication {

	public static void main(String[] args) {
		SpringApplication.run(HouseWithBeApplication.class, args);
	}

}
