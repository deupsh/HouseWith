package com.housewith.persistence.chore;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.housewith.domain.chore.Chore;

/** 작성자: 백승훈
 * 작성 시간: 2026-05-21/0929i
 * 마지막 수정자: 
 * 마지막 수정 시간:
 * 수정 내용: 
 * 역할: 특정 가족 그룹의 모든 집안일 마스터 규칙 조회 */

public interface ChoreRepository extends JpaRepository<Chore, Long> {
    List<Chore> findByUser_Id(Long userId);
}
