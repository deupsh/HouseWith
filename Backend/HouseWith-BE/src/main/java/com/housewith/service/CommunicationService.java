package com.housewith.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.housewith.domain.account.Profile;
import com.housewith.domain.account.User;
import com.housewith.domain.communication.FamilyMood;
import com.housewith.domain.communication.Question;
import com.housewith.domain.communication.UserAnswer;
import com.housewith.dto.communication.AnswerCreateRequest;
import com.housewith.dto.communication.FamilyAnswer;
import com.housewith.dto.communication.MoodCreateRequest;
import com.housewith.dto.communication.MoodResponse;
import com.housewith.dto.communication.QuestionResponse;
import com.housewith.persistence.account.ProfileRepository;
import com.housewith.persistence.account.UserRepository;
import com.housewith.persistence.communication.FamilyMoodRepository;
import com.housewith.persistence.communication.QuestionRepository;
import com.housewith.persistence.communication.UserAnswerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 조회로 설정, 수정이 필요하다면 @Transactional로 데이터 조작을 허용
public class CommunicationService {
    

    // DB 레포지토리 선언
    private final FamilyMoodRepository familyMoodRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final QuestionRepository questionRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    // 오늘의 기분 설정
    @Transactional
    public Long createMood(Long userId, Long slotId, MoodCreateRequest request) {
        FamilyMood mood = FamilyMood.builder()
                .userId(userId)
                .profileId(slotId)
                .moodText(request.getContent())
                .build();

        return familyMoodRepository.save(mood).getId();
    }

    // 오늘의 가족 기분 조회
    public List<MoodResponse> getTodayFamilyMoods(Long userId) {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        List<FamilyMood> recentMoods = familyMoodRepository.findByUserIdAndCreatedAtAfter(userId, twentyFourHoursAgo);

        // 가족 구성원 데이터를 단 한 번의 쿼리로 가져와 Map으로 매핑
        List<Profile> familyProfiles = profileRepository.findByUser_Id(userId);
        Map<Long, Profile> profileMap = familyProfiles.stream()
                .collect(Collectors.toMap(Profile::getId, profile -> profile));

        return recentMoods.stream()
                .map(mood -> {
                    Profile author = profileMap.get(mood.getProfileId());
                    return new MoodResponse(
                            author.getId(),
                            author.getNickname(),
                            author.getEmojiId(),
                            author.getBackgroundId(),
                            author.getCustomProfileImage(),
                            mood.getMoodText(),
                            mood.getCreatedAt(),
                            author.getLastAccessTime()
                    );
                })
                .toList();
    }

    //미접속 넛지 리스트 조회 (7일 이상 미접속자)
    public List<String> getNudgeList(Long userId) {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        List<Profile> inactiveProfiles = profileRepository.findByUser_IdAndLastAccessTimeBefore(userId, oneWeekAgo);

        return inactiveProfiles.stream()
                .map(profile -> "최근 일주일 동안 접속하지 않았어요. " + profile.getNickname() + "님에게 연락해보는 건 어떨까요?")
                .toList();
    }

    // 주간 질문 답변 제출
    @Transactional
    public Long submitAnswer(Long profileId, Long questionId, AnswerCreateRequest request) {
        UserAnswer answer = UserAnswer.builder()
                .profileId(profileId)
                .questionId(questionId)
                .content(request.getContent())
                .build();

        return userAnswerRepository.save(answer).getId();
    }

    // 주간 질의응답 화면 조회 (동적 주차 계산 및 블라인드 로직)
    public QuestionResponse getWeeklyQuestion(Long userId, Long myProfileId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("가족 그룹을 찾을 수 없습니다."));
        
        if (!user.getIsReceivingQuestion() || user.getCurrentQuestionId() == 0L) {
            throw new IllegalStateException("현재 활성화된 주간 질문이 없습니다.");
        }

        Question question = questionRepository.findById(user.getCurrentQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("질문 데이터를 찾을 수 없습니다."));

        List<UserAnswer> allAnswers = userAnswerRepository.findByQuestionId(question.getId());

        // 내가 쓴 답변 객체 찾기
        UserAnswer myAnswerObj = allAnswers.stream()
                .filter(a -> a.getProfileId().equals(myProfileId))
                .findFirst()
                .orElse(null);

        // 자바 표준 API를 활용한 동적 '주차(Week)' 계산 로직 (월요일 기준)
        LocalDate now = LocalDate.now();
        WeekFields weekFields = WeekFields.ISO; // ISO 표준: 월요일을 한 주의 시작으로 간주
        int currentYear = now.getYear();
        int currentWeek = now.get(weekFields.weekOfWeekBasedYear());
        String calculatedWeekLabel = currentYear + "년 " + currentWeek + "주차";

        // 블라인드 처리 로직 (내가 답변했을 때만 가족들 답변 노출)
        String myAnswerContent = (myAnswerObj != null) ? myAnswerObj.getContent() : null;
        List<FamilyAnswer> familyAnswers = List.of(); // 기본값: 텅 빈 리스트

        if (myAnswerObj != null) { // 내가 답변을 했다면 가족 리스트를 채움
            List<Profile> familyProfiles = profileRepository.findByUser_Id(userId);
            Map<Long, Profile> profileMap = familyProfiles.stream()
                    .collect(Collectors.toMap(Profile::getId, p -> p));

            familyAnswers = allAnswers.stream()
                    // 내 답변은 'myAnswerContent'로 따로 빼두었으니, 가족 리스트에서는 제외
                    .filter(answer -> !answer.getProfileId().equals(myProfileId)) 
                    .map(answer -> {
                        Profile p = profileMap.get(answer.getProfileId());
                        return new FamilyAnswer(
                                p.getNickname(),
                                p.getEmojiId(),
                                p.getBackgroundId(),
                                p.getCustomProfileImage(),
                                answer.getContent()
                        );
                    })
                    .toList();
        }

        return new QuestionResponse(
                question.getId(),
                question.getContent(),
                calculatedWeekLabel,
                myAnswerContent,
                familyAnswers
        );
    }
}
