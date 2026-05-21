package com.housewith.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.housewith.domain.account.Profile;
import com.housewith.domain.account.User;
import com.housewith.domain.chore.Chore;
import com.housewith.domain.chore.ChoreParticipant;
import com.housewith.domain.chore.ChoreRecord;
import com.housewith.dto.chore.ChoreCreateRequest;
import com.housewith.dto.chore.ChoreResponse;
import com.housewith.dto.chore.ChoreUpdateRequest;
import com.housewith.dto.member.ParticipantInfo;
import com.housewith.persistence.account.ProfileRepository;
import com.housewith.persistence.account.UserRepository;
import com.housewith.persistence.chore.ChoreParticipantRepository;
import com.housewith.persistence.chore.ChoreRecordRepository;
import com.housewith.persistence.chore.ChoreRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChoreService {
    private final ChoreRepository choreRepository;
    private final ChoreParticipantRepository choreParticipantRepository;
    private final ChoreRecordRepository choreRecordRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    // 집안일 등록
    @Transactional
    public Long createChore(Long userId, long profileId, ChoreCreateRequest request){
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("가족 그룹을 찾을 수 없습니다."));
        

        // 집안일 마스터 테이블(Chore) 저장
        Chore chore = Chore.builder()
            .user(user)
            .createdBy(profileId)
            .title(request.getTitle())
            .cycleType(request.getCycleType())
            .cycleValue(request.getScheduledDate() != null ? String.valueOf(request.getScheduledDate()) : null)
            .build();
        
        Chore savedChore = choreRepository.save(chore);

        // 담당자 목록 교차 테이블(ChoreParticipant)에 다중 저장
        saveParticipants(savedChore.getId(), request.getParticipantSlotIds());

        return savedChore.getId();
    }

    // 저장 로직
    private void saveParticipants(Long choreId, List<Long> participantIds) {
        if (participantIds == null || participantIds.isEmpty()) return;
        for (Long profileId : participantIds) {
            ChoreParticipant participant = ChoreParticipant.builder()
                    .choreId(choreId)
                    .profileId(profileId)
                    .build();
            choreParticipantRepository.save(participant);
        }
    }

    // ====================================================================

    // 집안일 수정
    @Transactional
    public void updateChore(Long choreId, ChoreUpdateRequest request){
        Chore chore = choreRepository.findById(choreId)
            .orElseThrow(() -> new IllegalArgumentException("해당 집안일을 찾을 수 없습니다."));
        
        // 정보 업데이트
        chore.updateChoreDetails(
            request.getTitle(),
            request.getCycleType(),
            request.getScheduledDate() != null ? String.valueOf(request.getScheduledDate()) : null
        );

        // 기존 매핑된 담당자 목록을 전부 지우고 새로 매핑
        choreParticipantRepository.deleteByChoreId(chore.getId());
        saveParticipants(chore.getId(), request.getParticipantSlotIds());
    }

    // ====================================================================

    // 집안일 목록 조회
    public List<ChoreResponse> getChoreByDate(Long userId, LocalDate targetDate){
        // 우리 가족 모든 집안일 가져오기
        List<Chore> allChores = choreRepository.findByUser_Id(userId);

        // 요청받은 날짜에 수행해야하는 집안일 필터링
        List<Chore> todayChores = allChores.stream()
                .filter(chore -> isChoreScheduledOnDate(chore, targetDate))
                .toList();

        if(todayChores.isEmpty()) return List.of();

        List<Long> choreIds = todayChores.stream().map(Chore::getId).toList();

        // 필터링된 집안일들에 배정받은 담당자와 오늘 기록을 한번에 조회
        List<ChoreParticipant> participants = choreParticipantRepository.findByChoreIdIn(choreIds);
        List<ChoreRecord> todayRecords = choreRecordRepository.findByChoreIdInAndCompletedAtBetween(
            choreIds, targetDate.atStartOfDay(), targetDate.atTime(LocalTime.MAX)
        );

        // 가족 프로필 딕셔너리 생성 
        List<Profile> familyProfiles = profileRepository.findByUser_Id(userId);
        Map<Long, Profile> profileMap = familyProfiles.stream()
                .collect(Collectors.toMap(Profile::getId, p -> p));

        // 최종 응답 DTO로 조립
        return todayChores.stream().map(chore -> {
            // 이 집안일이 오늘 완료되었는지 확인
            boolean isDone = todayRecords.stream().anyMatch(r -> r.getChoreId().equals(chore.getId()) && r.getIsCompleted());
            
            // 이 집안일의 담당자들의 상세 정보 조립
            List<ParticipantInfo> participantInfos = participants.stream()
                    .filter(p -> p.getChoreId().equals(chore.getId()))
                    .map(p -> {
                        Profile profile = profileMap.get(p.getProfileId());
                        return new ParticipantInfo(
                                profile.getId(), profile.getNickname(), String.valueOf(profile.getEmojiId()),
                                profile.getBackgroundId(), profile.getCustomProfileImage()
                        );
                    }).toList();

            Integer scheduledDate = chore.getCycleValue() != null ? Integer.valueOf(chore.getCycleValue()) : null;

            return new ChoreResponse(
                    chore.getId(), chore.getTitle(), chore.getCycleType(),
                    scheduledDate, isDone, participantInfos
            );
        }).toList();
    }

    // 주어진 날짜가 집안일의 반복 주기와 일치하는지 판별
    private boolean isChoreScheduledOnDate(Chore chore, LocalDate date) {
        int type = chore.getCycleType();
        if (type == 0 || type == 1) return true; // 0: 단발성, 1: 매일 (매일 표시)
        
        if (chore.getCycleValue() == null) return false;
        int value = Integer.parseInt(chore.getCycleValue());
        
        if (type == 2) { // 2: 매주 (0:일 ~ 6:토)
            int currentDayOfWeek = date.getDayOfWeek().getValue() % 7; // Java(1~7) -> JS식(0~6) 변환
            return currentDayOfWeek == value;
        } 
        if (type == 3) { // 3: 격주 (주차 계산 필요)
            int currentDayOfWeek = date.getDayOfWeek().getValue() % 7;
            if (currentDayOfWeek != value) return false;
            int currentWeek = date.get(WeekFields.ISO.weekOfWeekBasedYear());
            return currentWeek % 2 == 0; // 짝수 주차에만 노출 (기획에 따라 홀수로 변경 가능)
        }
        if (type == 4) { // 4: 매월 (날짜 일치)
            return date.getDayOfMonth() == value;
        }
        return false;
    }

    // ====================================================================

    // 집안일 완료 및 취소 토글 처리
    @Transactional
    public void toggleChoreComplete(Long choreId, Long ProfileId, LocalDate date){
        LocalDateTime atStartOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // 해당 날짜에 기록이 이미 있는지 확인
        List<ChoreRecord> records = choreRecordRepository.findByChoreIdInAndCompletedAtBetween(List.of(choreId), atStartOfDay, endOfDay);

        if(!records.isEmpty()){
            // 기존 기록이 있다면 삭제(토글 취소)
            choreRecordRepository.deleteAll(records);
        } else{
            // 기존 기록이 없다면 완료 처리로 신규 생성
            ChoreRecord newRecord = ChoreRecord.builder()
                    .choreId(choreId)
                    .profileId(ProfileId)
                    .build();
            ReflectionUtils_setCompletedAt(newRecord);
            choreRecordRepository.save(newRecord);
        }
    }

    private void ReflectionUtils_setCompletedAt(ChoreRecord record) {
        try {
            java.lang.reflect.Field isCompletedField = ChoreRecord.class.getDeclaredField("isCompleted");
            java.lang.reflect.Field completedAtField = ChoreRecord.class.getDeclaredField("completedAt");
            isCompletedField.setAccessible(true);
            completedAtField.setAccessible(true);
            isCompletedField.set(record, true);
            completedAtField.set(record, LocalDateTime.now());
        } catch (Exception e) {
            throw new RuntimeException("ChoreRecord 상태 변경 실패", e);
        }
    }

    // ====================================================================

    // 집안일 삭제 (관련 매핑 데이터도 연쇄 삭제)
    @Transactional
    public void deleteChore(Long choreId) {
        choreParticipantRepository.deleteByChoreId(choreId);
        choreRepository.deleteById(choreId);
    }
}
