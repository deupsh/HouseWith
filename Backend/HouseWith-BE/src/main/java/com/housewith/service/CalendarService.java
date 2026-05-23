package com.housewith.service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.housewith.domain.account.Profile;
import com.housewith.domain.account.User;
import com.housewith.domain.schedule.Calendar;
import com.housewith.domain.schedule.CalendarParticipant;
import com.housewith.dto.account.ParticipantInfo;
import com.housewith.dto.schedule.CalendarCreateRequest;
import com.housewith.dto.schedule.CalendarDetailResponse;
import com.housewith.dto.schedule.CalendarSummaryResponse;
import com.housewith.dto.schedule.CalendarUpdateRequest;
import com.housewith.persistence.account.ProfileRepository;
import com.housewith.persistence.account.UserRepository;
import com.housewith.persistence.schedule.CalendarParticipantRepository;
import com.housewith.persistence.schedule.CalendarRepository;

import lombok.RequiredArgsConstructor;

/** 작성자: 박성현
 * 작성 시간: 2026-05-21/0946i
 * 마지막 수정자: 박성현
 * 마지막 수정 시간:2026-05-21/0946i
 * 수정 내용: 
 * 역할: 일정 관리 비즈니스 로직 담당 Service */

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {

    private final CalendarRepository calendarRepository;
    private final CalendarParticipantRepository calendarParticipantRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    // 5_1 일정 등록 (POST /api/calendars)
    @Transactional
    public Long createCalendar(Long userId, Long currentProfileId, CalendarCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 가족 계정입니다."));

        // 1. 일정 엔티티 생성 (BaseTimeEntity로 createdAt 자동 생성)
        Calendar calendar = Calendar.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getMemo()) // 명세서의 memo -> 엔티티의 content
                .startTime(request.getStartDateTime())
                .endTime(request.getEndDateTime())
                .uploadedBy(currentProfileId) // 등록자 프로필 PK
                .build();

        Calendar savedCalendar = calendarRepository.save(calendar);

        // 2. 참여 멤버 매핑 (participantSlotIds가 빈 배열이거나 null이면 본인만 등록)
        List<Long> participantIds = request.getParticipantSlotIds();
        if (participantIds == null || participantIds.isEmpty()) {
            calendarParticipantRepository.save(
                    CalendarParticipant.builder()
                            .calendarId(savedCalendar.getId())
                            .profileId(currentProfileId)
                            .build()
            );
        } else {
            for (Long profileId : participantIds) {
                calendarParticipantRepository.save(
                        CalendarParticipant.builder()
                                .calendarId(savedCalendar.getId())
                                .profileId(profileId)
                                .build()
                );
            }
        }

        return savedCalendar.getId();
    }

    // 5_2 일정 수정 (PUT /api/calendars/{calendarId})
    @Transactional
    public void updateCalendar(Long calendarId, CalendarUpdateRequest request) {
        Calendar calendar = calendarRepository.findById(calendarId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 일정입니다."));

        // 1. 더티 체킹을 통한 일정 기본 정보 업데이트
        calendar.modifyCalendarDetails(
                request.getTitle(),
                request.getMemo(),
                request.getStartDateTime(),
                request.getEndDateTime()
        );

        // 2. 기존 참여자 리스트 전체 삭제 후 전달받은 리스트로 재등록 (무결성 보장)
        calendarParticipantRepository.deleteByCalendarId(calendarId);
        calendarParticipantRepository.flush();

        List<Long> newParticipantIds = request.getParticipantSlotIds();
        if (newParticipantIds != null && !newParticipantIds.isEmpty()) {
            for (Long profileId : newParticipantIds) {
                calendarParticipantRepository.save(
                        CalendarParticipant.builder()
                                .calendarId(calendarId)
                                .profileId(profileId)
                                .build()
                );
            }
        }
    }

    // 5_3 달력 기본 조회 (GET /api/calendars?year={year}&month={month})
    public List<CalendarSummaryResponse> getCalendarSummary(Long userId, int year, int month) {
        // 명확한 월별 조회를 위한 시작/종료 일시 동적 계산 로직
        YearMonth targetMonth = YearMonth.of(year, month);
        LocalDateTime startRange = targetMonth.atDay(1).atStartOfDay();
        LocalDateTime endRange = targetMonth.atEndOfMonth().atTime(23, 59, 59, 999999);

        List<Calendar> calendars = calendarRepository.findByUser_IdAndStartTimeBetween(userId, startRange, endRange);

        // 명세서 6_3 <달력 기본 조회> 규격에 맞춰 매핑
        return calendars.stream()
                .map(c -> new CalendarSummaryResponse(
                        c.getId(),
                        c.getTitle(),
                        c.getStartTime(),
                        c.getEndTime()
                ))
                .toList();
    }

    // 5_4 일정 상세 조회 (GET /api/calendars/{calendarId})
    public CalendarDetailResponse getCalendarDetail(Long calendarId, Long userId) {
        Calendar calendar = calendarRepository.findById(calendarId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 일정입니다."));

        // 1. 해당 일정의 참여자 매핑 데이터 목록
        List<CalendarParticipant> participants = calendarParticipantRepository.findByCalendarId(calendarId);

        // 2. 가족 전체 슬롯 인메모리 Map 캐싱 (N+1 문제 방어용 단건 쿼리)
        List<Profile> familyProfiles = profileRepository.findByUser_Id(userId);
        Map<Long, Profile> profileMap = familyProfiles.stream()
                .collect(Collectors.toMap(Profile::getId, p -> p));

        // 3. 업로더(작성자) 닉네임 매핑 (NPE 방어)
        Profile uploaderProfile = profileMap.get(calendar.getUploadedBy());
        String uploaderNickname = (uploaderProfile != null) ? uploaderProfile.getNickname() : "알 수 없는 구성원";

        // 4. 참여자 상세 정보(ParticipantInfo) 리스트 조립
        List<ParticipantInfo> participantInfos = participants.stream()
                .map(cp -> profileMap.get(cp.getProfileId()))
                .filter(profile -> profile != null) // 삭제된 프로필 방어
                .map(p -> new ParticipantInfo(
                        p.getId(),
                        p.getNickname(),
                        p.getEmojiId(), // String 타입으로 변경된 이모지 경로
                        p.getBackgroundId(),
                        p.getCustomProfileImage()
                ))
                .toList();

        // 5. 명세서 6_4 <일정 상세 조회> 규격에 맞춰 최종 반환
        return new CalendarDetailResponse(
                calendar.getId(),
                calendar.getTitle(),
                calendar.getStartTime(),
                calendar.getEndTime(),
                calendar.getContent(), // 엔티티의 content -> DTO의 memo
                uploaderNickname,
                participantInfos
        );
    }

    // 5_5 일정 삭제 (DELETE /api/calendars/{calendarId})
    @Transactional
    public void deleteCalendar(Long calendarId) {
        if (!calendarRepository.existsById(calendarId)) {
            throw new IllegalArgumentException("존재하지 않는 일정입니다.");
        }
        // 자식 테이블(참여자 매핑) 데이터 선행 삭제 후 부모 테이블 삭제
        calendarParticipantRepository.deleteByCalendarId(calendarId);
        calendarRepository.deleteById(calendarId);
    }
}