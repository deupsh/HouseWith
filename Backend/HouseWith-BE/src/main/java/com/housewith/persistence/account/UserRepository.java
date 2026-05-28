package com.housewith.persistence.account;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.housewith.domain.account.User;

/** 작성자: 박성현
 * 작성 시간: 2026-05-20/1006i
 * 마지막 수정자: 백승훈
 * 마지막 수정 시간:2026-05-28/1005i
 * 수정 내용: 아이디 비밀번호 찾기 추가
 * 역할: 사용자 계정 정보 영속성 관리 및 인증(로그인/회원가입) 처리 */

public interface UserRepository extends JpaRepository<User, Long> {
    // 1_1 가입 조건: 이메일 중복 검사용
    boolean existsByEmail(String email);
    
    // 로그인 시 이메일로 유저 찾기
    Optional<User> findByEmail(String email);
    
    // 폰 번호로 유저 찾기 (아이디 찾기용)
    List<User> findByPhoneNumber(String phoneNumber);
    // 이메일로 유저 찾기 (비밀번호 찾기용)
    Optional<User> findPwdByEmail(String email);
    
    // 활성화 상태이고, 질문 ID가 1~49 사이인 그룹들만 일괄 +1 업데이트 (방어막 적용)
    @Modifying(clearAutomatically = true)
    @Query("UPDATE User u SET u.currentQuestionId = u.currentQuestionId + 1 " +
           "WHERE u.isReceivingQuestion = true " +
           "AND u.currentQuestionId > 0 " +
           "AND u.currentQuestionId < 50")
    int incrementQuestionIdForActiveUsers();
}