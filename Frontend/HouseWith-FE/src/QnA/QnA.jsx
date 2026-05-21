import React, { useState } from 'react';
import axios from 'axios';
import './QnA.css';
import { iconList, colorList } from '../constants/profileOptions';

// 테스트용 더미
const MOCK_QUESTION_RESPONSE = {
  questionId: 12,
  content: "만약 우리 가족이 다 함께 무인도에 간다면 각자 어떤 역할을 할까요?",
  weekLabel: "2026년 5월 2주차",
  myAnswer: null, 
  answers: [
    {
      nickname: "엄마",
      profileEmoji: 1,
      profileBackground: 1,
      customProfileImage: null,
      content: "아빠가 불을 피우고 내가 요리를 할게!"
    },
    {
      nickname: "아빠",
      profileEmoji: 2,
      profileBackground: 2,
      customProfileImage: null,
      content: "난 낚시를 해서 식량을 구해오지!"
    }
  ]
};

const QnA = ({ currentProfile = { profile_type: 0, emoji_id: 3, background_id: 3, custom_profile_image: null } }) => {
  const [isQuestionEnabled, setIsQuestionEnabled] = useState(true);
  const [questionData, setQuestionData] = useState(null);
  const [myAnswerInput, setMyAnswerInput] = useState('');

  //Get
  const fetchWeeklyQuestion = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/qna/weekly', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestionData(response.data);
    } catch (error) {
      console.error("QnA 데이터를 불러오지 못했습니다.", error);
      // 백엔드 미연결 시 로컬 테스트를 위한 Fallback
      setQuestionData(MOCK_QUESTION_RESPONSE);
    }
  };

  // 컴포넌트 마운트 시 최초 1회 실행
  useEffect(() => {
    fetchWeeklyQuestion();
  }, []);

  //POST
  const handleAnswerSubmit = async () => {
    if (myAnswerInput.trim().length === 0) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      
      // 답변 전송
      await axios.post('/api/qna/answer', { answer: myAnswerInput.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 성공 시 데이터를 다시 불러와서 화면 갱신 (가족들의 답변이 보이도록!)
      fetchWeeklyQuestion();
      setMyAnswerInput('');

    } catch (error) {
      console.error("답변 제출 실패:", error);
      // Fallback: 로컬에서만 상태 업데이트
      setQuestionData({
        ...questionData,
        myAnswer: myAnswerInput.trim()
      });
      setMyAnswerInput('');
    }
  };

  //주간 질문 ON/OFF 설정 PATCH
  const handleToggleSettings = async () => {
    const newState = !isQuestionEnabled;
    setIsQuestionEnabled(newState);

    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch('/api/qna/settings', { enabled: newState }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("설정 변경 실패:", error);
      // 실패하더라도 Fallback 로컬 상태는 이미 업데이트됨
    }
  };
  // 데이터 로딩 중일 때 보여줄 화면
  if (!questionData) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>질문을 불러오는 중입니다... ⏳</div>;
  }

  return (
    <div className="qna-page">
      <div className="qna-header">
        <button className="week-nav-btn">{"<"}</button>
        <span className="current-week">{questionData.weekLabel}</span>
        <button className="week-nav-btn">{">"}</button>
      </div>

      <div className="qna-settings">
        <span>가족 주간 질문 받기</span>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={isQuestionEnabled} 
            onChange={handleToggleSettings}
          />
          <span className="slider round"></span>
        </label>
      </div>

      {isQuestionEnabled ? (
        <>
          <div className="question-box">
            <span className="q-mark">Q.</span>
            <p>{questionData.content}</p>
          </div>

          {questionData.myAnswer === null ? (
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
                  <span>제출하기</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="send-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="answer-list">
              <h3 className="answer-list-title">가족들의 답변 👨‍👩‍👧‍👦</h3>
              
              {/* 1. 내 답변 카드 */}
              <div className="answer-card my-card">
                <div 
                  className="avatar" 
                  style={{ backgroundColor: currentProfile.profile_type === 0 ? colorList[currentProfile.background_id] : 'transparent' }}
                >
                  {currentProfile.profile_type === 1 ? (
                    <img src={currentProfile.custom_profile_image} alt="my-profile" />
                  ) : (
                    <img src={iconList[currentProfile.emoji_id]} alt="my-profile" />
                  )}
                </div>
                <div className="content">
                  <strong>내 답변</strong>
                  <p>{questionData.myAnswer}</p>
                </div>
              </div>

              {/* 2. 가족 답변 카드 */}
              {questionData.answers.map((ans, idx) => (
                <div key={idx} className="answer-card">
                  <div 
                    className="avatar" 
                    style={{ backgroundColor: !ans.customProfileImage ? colorList[ans.profileBackground] : 'transparent' }}
                  >
                    {ans.customProfileImage ? (
                      <img src={ans.customProfileImage} alt={ans.nickname} />
                    ) : (
                      <img src={iconList[ans.profileEmoji]} alt={ans.nickname} />
                    )}
                  </div> 
                  <div className="content">
                    <strong>{ans.nickname}</strong>
                    <p>{ans.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="disabled-view">
          <span className="disabled-icon">💤</span>
          <p>현재 가족 주간 질문 기능이 <strong>OFF</strong> 상태입니다.<br/>상단의 스위치를 눌러 다시 활성화해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default QnA;