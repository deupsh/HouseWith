import React, { useState } from 'react';
import './QnA.css';

// 🌟 1년치(52주) 주간 질문 리스트 세팅 (LLM 등으로 생성한 데이터 가정)
const WEEKLY_QUESTIONS = [
  "올해 가족과 함께 이루고 싶은 목표가 있다면 무엇인가요?",
  "우리 가족의 가장 좋았던 추억이나 여행은 언제였나요?",
  "요즘 내가 가장 관심 있는 일이나 취미는 무엇인가요?",
  "가족에게 가장 고마웠던 순간은 언제인가요?",
  "만약 우리 가족이 다 함께 무인도에 간다면 각자 어떤 역할을 할까요?",
  "어릴 적 가장 좋아했던 음식과 그에 얽힌 추억은 무엇인가요?",
  "최근에 나를 가장 크게 웃게 만들었던 일은 무엇인가요?",
  "가족 구성원 각각의 가장 큰 장점은 무엇이라고 생각하나요?",
  "10년 뒤 우리 가족은 어떤 모습일까요?",
  "요즘 나를 가장 힘들게 하거나 고민하게 만드는 것은 무엇인가요?",
  // ... (필요에 따라 52개까지 채워넣을 수 있습니다. 여기서는 10개 예시 + 나머지 자동 생성)
  ...Array.from({ length: 42 }).map((_, i) => `${i + 11}번째 주간 질문입니다. 가족들과 나누고 싶은 이야기를 적어보세요!`)
];

// 더미 가족 답변 데이터 (내가 답변 완료 후 보이는 리스트)
const DUMMY_FAMILY_ANSWERS = [
  { name: '엄마', avatar: '👩', text: '아빠를 가장 존경해요. 항상 가족을 위해 헌신해주시니까요.' },
  { name: '아빠', avatar: '👨', text: '우리 딸, 아들이 건강하게 자라주는 것만으로도 너무 고맙지.' },
  { name: '아들', avatar: '👦', text: '다 같이 캠핑 갔을 때가 제일 재밌었어요!' },
];

const QnA = () => {
  // 🌟 [2_1] 주간 질문 수신 ON/OFF (Default 상태는 OFF)
  const [isQuestionEnabled, setIsQuestionEnabled] = useState(false);
  
  // 현재 보고 있는 주차 (0주차 ~ 51주차)
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // 주차별 내 답변을 저장하는 객체 { [weekIndex]: "내 답변 내용" }
  const [answeredWeeks, setAnsweredWeeks] = useState({});
  
  // 현재 입력 중인 내 답변
  const [myAnswerInput, setMyAnswerInput] = useState('');

  // 이전 주차로 이동
  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
      setMyAnswerInput(''); // 페이지 이동 시 입력창 초기화
    }
  };

  // 다음 주차로 이동
  const handleNextWeek = () => {
    if (currentWeekIndex < WEEKLY_QUESTIONS.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
      setMyAnswerInput('');
    }
  };

  // 🌟 [2_3] 내 답변 제출 처리 (답변 완료 시 다른 구성원 답변 조회 가능)
  const handleAnswerSubmit = () => {
    if (myAnswerInput.trim().length === 0) return;
    
    // 현재 주차에 내 답변 저장 (잠금 해제 역할)
    setAnsweredWeeks({
      ...answeredWeeks,
      [currentWeekIndex]: myAnswerInput.trim()
    });
    setMyAnswerInput('');
  };

  // 현재 주차에 내가 답변을 했는지 여부 확인
  const hasAnsweredCurrentWeek = !!answeredWeeks[currentWeekIndex];

  return (
    <div className="qna-page">
      <div className="qna-header">
        <button className="week-nav-btn" onClick={handlePrevWeek} disabled={currentWeekIndex === 0}>{"<"}</button>
        {/* 임시로 주차를 계산해서 보여줍니다 (예: 2026년 기준) */}
        <span className="current-week">2026년 {Math.floor(currentWeekIndex / 4) + 1}월 {(currentWeekIndex % 4) + 1}주차</span>
        <button className="week-nav-btn" onClick={handleNextWeek} disabled={currentWeekIndex === WEEKLY_QUESTIONS.length - 1}>{">"}</button>
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
          {/* 🌟 [2_2] 미리 저장된 52개의 질문 중 현재 주차에 맞는 질문 출력 */}
          <div className="question-box">
            <span className="q-mark">Q.</span>
            <p>{WEEKLY_QUESTIONS[currentWeekIndex]}</p>
          </div>

          {!hasAnsweredCurrentWeek ? (
            // 🌟 답변을 아직 안 했을 때 (잠금 화면)
            <div className="locked-view">
              <span className="lock-icon">🔒</span>
              <h3>답변이 필요해요!</h3>
              <p>다른 가족 구성원들의 답변을 보려면 먼저 내 답변을 작성해주세요.</p>
              
              <div className="my-answer-input">
                <p className="input-label">내 답변 작성하기</p>
                <input 
                  type="text" 
                  placeholder="이번 주 질문에 답변해주세요..." 
                  value={myAnswerInput}
                  onChange={(e) => setMyAnswerInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                />
                <button onClick={handleAnswerSubmit} className="submit-btn">
                  <span>답변 제출하기</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="send-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            // 🌟 답변을 완료했을 때 (가족들의 답변 리스트 출력)
            <div className="answer-list">
              <h3 className="answer-list-title">가족들의 답변 👨‍👩‍👧‍👦</h3>
              
              {/* 내 답변 카드 (제일 위에 표시) */}
              <div className="answer-card my-card">
                <div className="avatar">👧</div>
                <div className="content">
                  <strong>딸 (나)</strong>
                  <p>{answeredWeeks[currentWeekIndex]}</p>
                </div>
              </div>

              {/* 더미 가족 답변 카드들 */}
              {DUMMY_FAMILY_ANSWERS.map((ans, idx) => (
                <div key={idx} className="answer-card">
                  <div className="avatar">{ans.avatar}</div>
                  <div className="content">
                    <strong>{ans.name}</strong>
                    <p>{ans.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // 질문 기능을 껐을 때
        <div className="disabled-view">
          <span className="disabled-icon">💤</span>
          <p>현재 가족 주간 질문 기능이 <strong>OFF</strong> 상태입니다.<br/>상단의 스위치를 눌러 다시 활성화해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default QnA;