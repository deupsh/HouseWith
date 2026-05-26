package com.housewith.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.housewith.service.ChoreService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChoreScheduler {

    private final ChoreService choreService;

    // cron = "초 분 시 일 월 요일" -> 매일 자정(00:00:00)에 실행
    // 한국 시간(Asia/Seoul) 기준 명시
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    public void runDailyChoreArchiving() {
        log.info("[스케줄러] 매일 자정 - 어제자 미완료 집안일 이력 적재 시작");
        
        try {
            int failedCount = choreService.archiveYesterdayUnfinishedChores();
            log.info("[스케줄러] 집안일 마감 완료. 총 {}건의 미완료 이력이 적재되었습니다.", failedCount);
        } catch (Exception e) {
            log.error("[스케줄러 오류] 집안일 마감 처리 중 에러 발생: ", e);
        }
    }
}