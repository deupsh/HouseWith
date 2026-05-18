import React, { useState } from 'react';
import './QnA.css';

const QnA = () => {
  // 질문 수신 ON/OFF 상태 관리
  const [isQuestionEnabled, setIsQuestionEnabled] = useState(true);
  // 내가 답변을 했는지 여부 (잠금 화면 테스트용)
  const [hasAnswered, setHasAnswered] = useState(false);

  return (
    <div className="qna-page">
      <div className="qna-header">
        <button className="week-nav-btn">{"<"}</button>
        <span className="current-week">2026년 5월 2주차</span>
        <button className="week-nav-btn">{">"}</button>
      </div>

      {/* 질문 수신 ON/OFF 토글 설정 영역 */}
      <div className="qna-settings">
        <span>가족 주간 질문 받기</span>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={isQuestionEnabled} 
            onChange={() => setIsQuestionEnabled(!isQuestionEnabled)} 
          />
          <span className="slider round"></span>
        </label>
      </div>

      {isQuestionEnabled ? (
        <>
          <div className="question-box">
            <p>올해 가족과 함께 이루고 싶은 목표가 있다면 무엇인가요?</p>
          </div>

          {!hasAnswered ? (
            // 답변을 아직 안 했을 때 (잠금 화면)
            <div className="locked-view">
              <span className="lock-icon">🔒</span>
              <h3>답변이 필요해요!</h3>
              <p>다른 가족 구성원들의 답변을 보려면 먼저 내 답변을 작성해주세요.</p>
              
              <div className="my-answer-input">
                <p className="input-label">내 답변 작성하기</p>
                <input type="text" placeholder="이번 주 질문에 답변해주세요..." />
                <button onClick={() => setHasAnswered(true)} className="submit-btn">
                  종이비행기 아이콘 제출
                </button>
              </div>
            </div>
          ) : (
            // 답변을 완료했을 때 (목록 화면 - 목업 5번 이미지)
            <div className="answer-list">
              <div className="answer-card">
                <div className="avatar">👩</div>
                <div className="content">
                  <strong>엄마</strong>
                  <p>아빠를 가장 존경해요. 항상 가족을 위해...</p>
                </div>
              </div>
              {/* 추가 답변 카드들... */}
            </div>
          )}
        </>
      ) : (
        // 질문 기능을 껐을 때
        <div className="disabled-view">
          <p>현재 가족 주간 질문 기능이 꺼져있습니다.<br/>상단의 버튼을 눌러 다시 활성화해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default QnA;