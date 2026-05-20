package com.housewith.persistence.account;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.housewith.domain.account.User;

/** 작성자: 박성현
 * 작성 시간: 2026-05-20/1006i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1006i
 * 수정 내용: 
 * 역할: 사용자 계정 정보 영속성 관리 및 인증(로그인/회원가입) 처리 */

public interface UserRepository extends JpaRepository<User, Long> {
    // 1_1 가입 조건: 이메일 중복 검사용
    boolean existsByEmail(String email);
    
    // 로그인 시 이메일로 유저 찾기
    Optional<User> findByEmail(String email);
}