package com.housewith.persistence.chore;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.housewith.domain.chore.ChoreParticipant;

/** 작성자: 백승훈
 * 작성 시간: 2026-05-21/0932i
 * 마지막 수정자: 
 * 마지막 수정 시간:
 * 수정 내용: 
 * 역할: 특정 집안일들에 매핑된 담당자 목록 일괄 조회 및 매핑 정보 삭제*/

public interface ChoreParticipantRepository extends JpaRepository<ChoreParticipant, Long>  {
    List<ChoreParticipant> findByChoreIdIn(List<Long> choreIds);

    void deleteByChoreId(Long choreId);    
}
