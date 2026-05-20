package com.housewith.persistence.communication;

import com.housewith.domain.communication.Question;
import org.springframework.data.jpa.repository.JpaRepository;

/** 작성자: 백승훈
 * 작성 시간: 2026-05-20/1615i
 * 마지막 수정자: 
 * 마지막 수정 시간:
 * 수정 내용: 
 * 역할: 인터페이스 역할 */

public interface QuestionRepository extends JpaRepository<Question, Long> {

}