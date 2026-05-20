package com.housewith.persistence.account;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.housewith.domain.account.Profile;

/** 작성자: 박성현
 * 작성 시간: 2026-05-20/1010i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1010i
 * 수정 내용: 
 * 역할: 가족 그룹 내 프로필(슬롯) 데이터 영속성 관리 및 상태(접속 시간, 제한 수) 검증 */

public interface ProfileRepository extends JpaRepository<Profile, Long> {
	// 1_2 조건: 슬롯 개수 최대 10개 제한 (생성 전 카운트 체크용)
	long countByUser_Id(Long userId);

	// 7_2 미접속 넛지: 특정 시간(일주일 전) 이전에 마지막으로 접속한 프로필 찾기
	List<Profile> findByUser_IdAndLastAccessTimeBefore(Long userId, LocalDateTime oneWeekAgo);
	
	// 3_1 로그인 후 화면: 해당 유저(계정)에 속한 전체 가족 슬롯 목록 가져오기
	List<Profile> findByUser_Id(Long userId);
}
