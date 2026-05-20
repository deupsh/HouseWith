package com.housewith.persistence.communication;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.housewith.domain.communication.UserAnswer;

/** 작성자: 박성현
 * 작성 시간: 2026-05-20/1022i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-20/1022i
 * 수정 내용: 
 * 역할: 주간 질문에 대한 가족 구성원의 답변 데이터 영속성 관리 및 조회 */

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
	// 2_3 주간 질문 조회: 특정 질문에 대해 가족들이 남긴 답변 목록 가져오기
	List<UserAnswer> findByQuestionId(Long questionId);
}