package com.housewith.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.housewith.service.CommunicationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuestionScheduler {

    private final CommunicationService communicationService;

    // cron = "초 분 시 일 월 요일" -> 매주 월요일 새벽 00:00:00에 실행
    // 한국 시간(Asia/Seoul) 기준 명시
    @Scheduled(cron = "0 0 0 * * MON", zone = "Asia/Seoul")
    public void runWeeklyQuestionIncrement() {
        log.info("[스케줄러] 매주 월요일 자정 - 주간 질문 ID 일괄 갱신 시작");
        
        try {
            int updatedCount = communicationService.incrementWeeklyQuestionIds();
            log.info("[스케줄러] 주간 질문 ID 갱신 완료. 총 {}개의 가족 그룹이 다음 질문으로 이동했습니다.", updatedCount);
        } catch (Exception e) {
            log.error("[스케줄러 오류] 주간 질문 ID 갱신 중 에러 발생: ", e);
        }
    }
}