import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QnA.css';
import { iconList, colorList } from '../constants/profileOptions';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  const profileId = localStorage.getItem('currentSlotId');
  return { headers: { Authorization: `Bearer ${token}`, 'X-Profile-Id': profileId } };
};

const getWeekLabel = (offset) => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (offset * 7));
  
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  
  // 자바의 Locale.KOREA (일요일 시작 기준) 주차 계산 로직 재현
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)
  
  // 해당 월의 몇 주차인지 계산
  const weekOfMonth = Math.ceil((targetDate.getDate() + firstDayOfWeek) / 7);
  
  return `${year}년 ${month}월 ${weekOfMonth}주차`;
};

const QnA = ({ currentProfile = { profile_type: 0, emoji_id: 3, background_id: 3, custom_profile_image: null } }) => {
  const [isQuestionEnabled, setIsQuestionEnabled] = useState(true);
  const [questionData, setQuestionData] = useState(null);
  const [myAnswerInput, setMyAnswerInput] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  const fetchWeeklyQuestion = async () => {
    try {
      const response = await axios.get(`/api/questions?offset=${weekOffset}`, getAuthHeaders());
      setQuestionData(response.data);
      
      if (response.data && response.data.isReceivingQuestion !== undefined) {
        setIsQuestionEnabled(response.data.isReceivingQuestion);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const errorMessage = error.response.data; // 백엔드가 보낸 에러 메시지 추출

        // 🚨 1. 과거 질문이 없는 경우 (스위치를 건드리지 않음!)
        if (typeof errorMessage === 'string' && errorMessage.includes("과거")) {
          setQuestionData({
            isNotExist: true, // 새로운 플래그 추가
            weekLabel: getWeekLabel(weekOffset),
            content: "해당 주차에는 생성된 주간 질문이 없습니다."
          });
        } 
        // 🚨 2. 기능 자체가 꺼져 있는 경우
        else {
          setIsQuestionEnabled(false);
          setQuestionData({
            isEmpty: true,
            weekLabel: "주간 질문 안내",
            content: "주간 질문이 비활성화되어있어요. 활성화해서 주간 질문을 받아보세요!"
          });
        }
      } else {
        console.error("데이터를 불러오지 못했습니다.", error);
        setQuestionData({
          isEmpty: true,
          weekLabel: "오류",
          content: "데이터를 불러오는 중 문제가 발생했습니다."
        });
      }
    }
  };

  useEffect(() => {
    fetchWeeklyQuestion();
  }, [weekOffset]);

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => prev + 1);

  const handleAnswerSubmit = async () => {
    if (myAnswerInput.trim().length === 0) return;
    
    try {
      await axios.post(
        `/api/questions/${questionData.questionId}/answers`, 
        { content: myAnswerInput.trim() }, 
        getAuthHeaders()
      );
      fetchWeeklyQuestion();
      setMyAnswerInput('');
    } catch (error) {
      console.error("답변 제출 실패:", error);
    }
  };

  const handleToggleSettings = async () => {
    const newState = !isQuestionEnabled;
    setIsQuestionEnabled(newState);
    try {
      await axios.patch('/api/questions/settings', { isReceivingQuestion: newState }, getAuthHeaders());
      fetchWeeklyQuestion();
    } catch (error) {
      console.error("설정 변경 실패:", error);
      setIsQuestionEnabled(!newState);
    }
  };

  if (!questionData) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>질문을 불러오는 중입니다... ⏳</div>;
  }

  let contentBody = null;

  // 1. 아예 기능이 꺼진 경우 (스위치 OFF)
  if (questionData.isEmpty) {
    contentBody = (
      <div className="disabled-view">
        <span className="disabled-icon">💤</span>
        <p>{questionData.content}</p>
      </div>
    );
  } 
  // 2. 🚨 기능은 켜져 있는데 과거 질문 자체가 없는 경우
  else if (questionData.isNotExist) {
    contentBody = (
      <div className="disabled-view">
        <span className="disabled-icon">📭</span> {/* 텅 빈 우체통 느낌의 이모지 */}
        <p>{questionData.content}</p>
      </div>
    );
  } 
  // 3. 질문이 정상적으로 있는 경우
  else {
    contentBody = (
      <>
        <div className="question-box">
          <span className="q-mark">Q{questionData.questionId}.</span>
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
                  <img 
                    src={`http://localhost/uploads${currentProfile.custom_profile_image}`} 
                    alt="my-profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <img src={iconList[currentProfile.emoji_id]} alt="my-profile" />
                )}
              </div>
              <div className="content">
                <strong>내 답변</strong>
                <p>{questionData.myAnswer}</p>
              </div>
            </div>

            {/* 🚨 2. 성현님 기획 반영: 가족 답변이 하나도 없을 때의 처리 */}
            {questionData.answers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>
                <p>아직 답변을 남긴 가족이 없습니다.</p>
              </div>
            ) : (
              // 가족 답변이 있을 때는 맵핑해서 렌더링
              questionData.answers.map((ans, idx) => (
                <div key={idx} className="answer-card">
                  <div 
                    className="avatar" 
                    style={{ backgroundColor: ans.profileType === 0 ? colorList[ans.profileBackground] : 'transparent' }}
                  >
                    {ans.profileType === 1 ? (
                      <img 
                        src={`http://localhost/uploads${ans.customProfileImage}`} 
                        alt={ans.nickname} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <img src={iconList[ans.profileEmoji]} alt={ans.nickname} className="avatar-img emoji-avatar" />
                    )}
                  </div> 
                  <div className="content">
                    <strong>{ans.nickname}</strong>
                    <p>{ans.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="qna-page">
      <div className="qna-header">
        <button className="week-nav-btn" onClick={handlePrevWeek}>{"<"}</button>
        <span className="current-week">{questionData.weekLabel}</span>
        <button 
          className="week-nav-btn" 
          onClick={handleNextWeek}
          disabled={weekOffset >= 0} // 기능 동작 막기
          style={{ visibility: weekOffset >= 0 ? 'hidden' : 'visible' }}
        >
          {">"}
        </button>
      </div>
      <div className="qna-settings">
        <span>가족 주간 질문 받기</span>
        <label className="toggle-switch">
          <input type="checkbox" checked={isQuestionEnabled} onChange={handleToggleSettings} />
          <span className="slider round"></span>
        </label>
      </div>
      {contentBody}
    </div>
  );
};

export default QnA;