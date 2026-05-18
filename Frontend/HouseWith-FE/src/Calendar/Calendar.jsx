import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Lock } from 'lucide-react';
import './Calendar.css';

const Calendar = () => {
  // 임시 가족 한줄 메모 데이터 (인스타그램 메모 스타일)
  const familyNotes = [
    { id: 1, name: '나(엄마)', avatar: '👩', time: '방금 전', note: '냉장고에 과일 깎아뒀으니 다들 챙겨 먹어~ 🍎', isCurrentUser: true },
    { id: 2, name: '아빠', avatar: '👨', time: '2시간 전', note: '오늘 야근 확정... 저녁 먼저 먹어 ㅠㅠ', status: '2일째 미접속', isAlert: true },
    { id: 3, name: '딸', avatar: '👧', time: '5시간 전', note: '이번 주말에 친구들이랑 놀이공원 갈래! 🎢' },
    { id: 4, name: '아들', avatar: '👦', time: '10시간 전', note: '아 피곤해... 오늘 학원 쉬고 싶다 😪' },
  ];

  // 임시 일정 데이터
  const events = {
    15: { text: '엄마 생일', color: '#E6F0E7' },
    18: { text: '딸 학원...', color: '#FFF3CD' },
    20: { text: '가족 외식', color: '#FDECE8' }
  };

  // 2026년 5월 달력 배열 생성 (1일은 금요일)
  const daysInMonth = 31;
  const firstDayOfMonth = 5; 
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = [...blanks, ...days];

  return (
    <div className="calendar-page">
      <section className="note-section">
        <div className="section-header">
          <h2>오늘의 한줄</h2>
          <p className="subtitle">24시간 동안만 보이는 상태 메시지예요</p>
        </div>
        
        <div className="note-cards-container">
          {familyNotes.map((member) => (
            <div key={member.id} className={`note-card ${member.isCurrentUser ? 'current-user' : ''}`}>
              {member.isAlert && (
                <div className="alert-badge">{member.status}</div>
              )}
              
              <div className="avatar-large">{member.avatar}</div>
              <strong className="member-name">{member.name}</strong>
              <span className="time-text">{member.time}</span>
              
              {/* 메모가 들어가는 말풍선 */}
              <div className="note-bubble">
                {member.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 달력 섹션 (기존과 동일) */}
      <section className="calendar-section">
        <div className="calendar-header">
          <div className="month-selector">
            <h2>2026년 5월</h2>
            <div className="month-arrows">
              <button className="icon-btn"><ChevronLeft size={24} /></button>
              <button className="icon-btn"><ChevronRight size={24} /></button>
            </div>
          </div>
          <button className="add-event-btn">
            <Plus size={20} /> 일정 추가
          </button>
        </div>

        <div className="calendar-grid">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
          
          {totalSlots.map((day, index) => {
            // 실제 오늘 날짜와 달력의 날짜가 일치하는지 확인 (2026년 5월 기준)
            const today = new Date();
            const isToday = day && 
                            today.getFullYear() === 2026 && 
                            (today.getMonth() + 1) === 5 && 
                            today.getDate() === day;

            return (
                <div 
                key={index} 
                className={`day-cell ${day ? '' : 'empty'} ${isToday ? 'today' : ''}`} // ★ 오늘이면 'today' 클래스 추가
                >
                {day && (
                    <>
                    <span className="day-number">{day}</span>
                    {events[day] && (
                        <div 
                        className="event-badge" 
                        style={{ backgroundColor: events[day].color }}
                        >
                        {events[day].text}
                        </div>
                    )}
                    </>
                )}
                </div>
            );
            })}
        </div>
      </section>
    </div>
  );
};

export default Calendar;