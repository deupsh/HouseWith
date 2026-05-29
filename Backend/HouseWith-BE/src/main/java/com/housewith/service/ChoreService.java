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
import com.housewith.dto.account.ParticipantInfo;
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
    public void updateChore(Long choreId, Long userId, ChoreUpdateRequest request){
        Chore chore = choreRepository.findById(choreId)
            .orElseThrow(() -> new IllegalArgumentException("해당 집안일을 찾을 수 없습니다."));
        
        // 권한 방어
        if (!chore.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }
        
        // 정보 업데이트
        chore.updateChoreDetails(
            request.getTitle(),
            request.getCycleType(),
            request.getScheduledDate() != null ? String.valueOf(request.getScheduledDate()) : null
        );

        // 기존 매핑된 담당자 목록을 전부 지우고 새로 매핑
        choreParticipantRepository.deleteByChoreId(chore.getId());
        choreParticipantRepository.flush();
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
                                profile.getBackgroundId(), profile.getCustomProfileImage(), profile.getProfileType()
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
        	int currentDayOfWeek = date.getDayOfWeek().getValue() - 1; // Java(1~7) -> JS식(0~6) 변환
            return currentDayOfWeek == value;
        } 
        if (type == 3) { // 3: 격주 (주차 계산 필요)
        	int currentDayOfWeek = date.getDayOfWeek().getValue() - 1;
            if (currentDayOfWeek != value) return false;
            int currentWeek = date.get(WeekFields.ISO.weekOfWeekBasedYear());
            return currentWeek % 2 == 0; // 짝수 주차에만 노출 (기획에 따라 홀수로 변경 가능)
        }
        /*
        // 미검증 격주 로직(검증 필요)
        if (type == 3) { // 3: 격주 
            int currentDayOfWeek = date.getDayOfWeek().getValue() - 1;
            if (currentDayOfWeek != value) return false;
            
            // [보완] JPA Auditing null 안전성 확보
            LocalDateTime createdDateTime = chore.getCreatedAt();
            LocalDate createdAt = (createdDateTime != null) ? createdDateTime.toLocalDate() : LocalDate.now();
            
            // 1. JS 요일(0:일 ~ 6:토)을 Java DayOfWeek(1:월 ~ 7:일) 체계로 변환
            int javaDayValue = (value == 0) ? 7 : value;
            java.time.DayOfWeek targetDayOfWeek = java.time.DayOfWeek.of(javaDayValue);
            
            // 2. 생성일 '당일 또는 그 이후' 최초로 돌아오는 해당 요일을 첫 실행일로 지정
            LocalDate firstOccurrenceDate = createdAt.with(
                java.time.temporal.TemporalAdjusters.nextOrSame(targetDayOfWeek)
            );
            
            // [보완] 첫 실행일보다 이전 날짜를 조회하는 경우 무조건 제외 (과거 노출 버그 차단)
            if (date.isBefore(firstOccurrenceDate)) return false;
            
            // 3. 최초 실행일이 속한 주와 현재 검사하는 주 사이의 '주(Week) 차이' 계산
            long weeksBetween = java.time.temporal.ChronoUnit.WEEKS.between(
                firstOccurrenceDate.with(java.time.DayOfWeek.MONDAY), 
                date.with(java.time.DayOfWeek.MONDAY)
            );
            
            // 4. 최초 실행 주(차이 0) 및 2주 간격 노출
            return weeksBetween % 2 == 0; 
        }
        */
        if (type == 4) { // 4: 매월 (날짜 일치)
            return date.getDayOfMonth() == value;
        }
        return false;
    }

    // ====================================================================

    // 집안일 완료 및 취소 토글 처리
    @Transactional
    public void toggleChoreComplete(Long choreId, Long userId, Long ProfileId, LocalDate date){
    	// 객체 검증 및 권한
    	Chore chore = choreRepository.findById(choreId)
                .orElseThrow(() -> new IllegalArgumentException("해당 집안일을 찾을 수 없습니다."));

            if (!chore.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("권한이 없습니다.");
            }
    	
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
    public void deleteChore(Long choreId, Long userId) {
    	Chore chore = choreRepository.findById(choreId)
                .orElseThrow(() -> new IllegalArgumentException("해당 집안일을 찾을 수 없습니다."));

            if (!chore.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("권한이 없습니다.");
            }
    	
        choreParticipantRepository.deleteByChoreId(choreId);
        choreRepository.deleteById(choreId);
    }
    
    // 스케줄러 전용 로직: 매일 자정에 호출되어 '어제' 미완료된 집안일 이력 적재
    @Transactional
    public int archiveYesterdayUnfinishedChores() {
        // 1. 기준은 스케줄러 실행 시점(오늘 자정) 기준 '-1일(어제)'
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfYesterday = yesterday.atStartOfDay();
        LocalDateTime endOfYesterday = yesterday.atTime(LocalTime.MAX); // 어제 23:59:59

        // 2. 모든 집안일 마스터 정보 조회
        List<Chore> allChores = choreRepository.findAll();

        // 3. 메서드 재활용! 어제 수행해야 했던 집안일만 필터링
        List<Chore> yesterdayChores = allChores.stream()
                .filter(chore -> isChoreScheduledOnDate(chore, yesterday))
                .toList();

        if (yesterdayChores.isEmpty()) return 0;

        List<Long> choreIds = yesterdayChores.stream().map(Chore::getId).toList();

        // 4. 어제 수행해야 했던 집안일들의 전체 담당자 목록과, 어제 이미 완료한 기록 조회
        List<ChoreParticipant> participants = choreParticipantRepository.findByChoreIdIn(choreIds);
        List<ChoreRecord> yesterdayRecords = choreRecordRepository.findByChoreIdInAndCompletedAtBetween(
                choreIds, startOfYesterday, endOfYesterday
        );

        int failedCount = 0;

        // 5. 집안일(Chore) 기준으로 먼저 완료 여부 판단 후, 미완료 시 담당자들에게 0점 부여
        for (Chore chore : yesterdayChores) {
            
            // 핵심: "누가 했든 상관없이, 어제 이 집안일에 대한 완료 기록(isCompleted = 1)이 1개라도 있는가?"
            boolean isChoreCompleted = yesterdayRecords.stream()
                    .anyMatch(r -> r.getChoreId().equals(chore.getId()) && r.getIsCompleted());

            // 아무도 이 집안일을 완료하지 않았다면 (isChoreCompleted == false)
            if (!isChoreCompleted) {
                
                // 이 집안일에 배정된 불쌍한 담당자들을 찾아서 모두에게 0점(미완료) 폭탄을 내립니다.
                List<ChoreParticipant> choreParticipants = participants.stream()
                        .filter(p -> p.getChoreId().equals(chore.getId()))
                        .toList();

                for (ChoreParticipant participant : choreParticipants) {
                    ChoreRecord failedRecord = ChoreRecord.builder()
                            .choreId(chore.getId())
                            .profileId(participant.getProfileId())
                            .build();

                    // 시간을 어제 날짜로 조작
                    ReflectionUtils_setFailedAt(failedRecord, endOfYesterday);
                    
                    choreRecordRepository.save(failedRecord);
                    failedCount++;
                }
            }
        }
        return failedCount;
    }

    // 미완료 기록의 시간(어제 23:59:59)을 세팅하기 위한 리플렉션 유틸
    private void ReflectionUtils_setFailedAt(ChoreRecord record, LocalDateTime failedTime) {
        try {
            java.lang.reflect.Field isCompletedField = ChoreRecord.class.getDeclaredField("isCompleted");
            java.lang.reflect.Field completedAtField = ChoreRecord.class.getDeclaredField("completedAt");
            isCompletedField.setAccessible(true);
            completedAtField.setAccessible(true);
            isCompletedField.set(record, false); // 미완료 상태 명시 (0)
            completedAtField.set(record, failedTime); // 시간을 어제 날짜로 조작
        } catch (Exception e) {
            throw new RuntimeException("ChoreRecord 실패 상태 변경 실패", e);
        }
    }
}