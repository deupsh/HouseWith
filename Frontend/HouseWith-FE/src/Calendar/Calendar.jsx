import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 🌟 Axios 임포트
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import FamilyNote from '../components/FamilyNote'; 
import CalendarModal from './CalendarModal';
import './Calendar.css';

// 🌟 임시 더미 데이터 (백엔드 서버가 아직 없을 때 보여줄 기본 일정)
const MOCK_EVENTS = [
  { id: 1, title: '엄마 생일', startDate: '2026-05-15T10:00', endDate: '2026-05-15T22:00', memo: '가족 외식 예정', writer: '엄마', participants: ['엄마', '아빠', '딸', '아들'], color: '#E6F0E7' },
  { id: 2, title: '딸 학원 상담', startDate: '2026-05-18T17:00', endDate: '2026-05-18T18:00', memo: '성적표 지참', writer: '아빠', participants: ['아빠', '딸'], color: '#FFF3CD' },
  { id: 3, title: '가족 외식', startDate: '2026-05-20T19:00', endDate: '2026-05-20T21:00', memo: '예약 확인하기', writer: '엄마', participants: ['엄마', '아빠', '딸', '아들'], color: '#FDECE8' }
];

const Calendar = ({ showToast }) => {
  const currentUser = '엄마';
  const familyMembers = ['엄마', '아빠', '딸', '아들'];

  // 🌟 1. 이벤트 상태 초기화 (처음엔 빈 배열로 시작)
  const [events, setEvents] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedEvent, setSelectedEvent] = useState(null);

  const daysInMonth = 31;
  const firstDayOfMonth = 5; 
  const totalSlots = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  // 🌟 2. 캘린더 데이터 불러오기 (GET)
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // 백엔드에 2026년 5월 일정 요청
      const response = await axios.get('/api/calendar/events?year=2026&month=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error("일정 불러오기 실패 (서버 미준비):", error);
      setEvents(MOCK_EVENTS); // 에러 시 임시 더미 데이터 세팅
    }
  };

  // 화면이 처음 렌더링될 때 자동으로 fetchEvents 실행
  useEffect(() => {
    fetchEvents();
  }, []);

  // 날짜 클릭 핸들러
  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDateStr = `2026-05-${String(day).padStart(2, '0')}`;
    const dayEvent = events.find(e => e.startDate.startsWith(clickedDateStr));

    if (dayEvent) {
      setSelectedEvent(dayEvent);
      setModalMode('detail');
    } else {
      setSelectedEvent({ defaultDate: `${clickedDateStr}T12:00` });
      setModalMode('create');
    }
    setIsModalOpen(true);
  };

  // 🌟 3. 일정 저장 핸들러 (등록 POST / 수정 PUT)
  const handleModalSubmit = async (eventData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      if (modalMode === 'create') {
        const colors = ['#E6F0E7', '#FFF3CD', '#FDECE8', '#E3F2FD', '#F3E5F5'];
        const randomColor = colors[events.length % colors.length];
        const newEventPayload = { ...eventData, color: randomColor };

        // [API 전송 - POST] 새로운 일정 추가
        const response = await axios.post('/api/calendar/events', newEventPayload, { headers });
        setEvents([...events, response.data]); // 백엔드가 준 진짜 데이터로 업데이트
        if (showToast) showToast("새 일정이 등록되었어요! 🗓️");

      } else if (modalMode === 'edit') {
        // [API 전송 - PUT] 기존 일정 수정
        const response = await axios.put(`/api/calendar/events/${eventData.id}`, eventData, { headers });
        setEvents(events.map(e => e.id === eventData.id ? response.data : e));
        if (showToast) showToast("일정 수정이 완료되었습니다.");
      }
      setIsModalOpen(false);

    } catch (error) {
      console.error("일정 저장 실패:", error);
      
      // 🚨 서버 통신 실패 시 UI 테스트를 위한 Fallback (가짜 저장)
      if (modalMode === 'create') {
        const colors = ['#E6F0E7', '#FFF3CD', '#FDECE8', '#E3F2FD', '#F3E5F5'];
        const randomColor = colors[events.length % colors.length];
        setEvents([...events, { ...eventData, id: Date.now(), color: randomColor }]);
        if (showToast) showToast("새 일정이 등록되었어요! 🗓️ (로컬)");
      } else if (modalMode === 'edit') {
        setEvents(events.map(e => e.id === eventData.id ? { ...e, ...eventData } : e));
        if (showToast) showToast("일정 수정이 완료되었습니다. (로컬)");
      }
      setIsModalOpen(false);
    }
  };

  // 🌟 4. 일정 삭제 핸들러 (DELETE)
  const handleEventDelete = async (eventId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // [API 전송 - DELETE] 일정 삭제
      await axios.delete(`/api/calendar/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEvents(events.filter(e => e.id !== eventId));
      setIsModalOpen(false);
      if (showToast) showToast("일정이 정상적으로 삭제되었습니다.");

    } catch (error) {
      console.error("일정 삭제 실패:", error);
      // 🚨 서버 통신 실패 시 UI 테스트를 위한 Fallback (가짜 삭제)
      setEvents(events.filter(e => e.id !== eventId));
      setIsModalOpen(false);
      if (showToast) showToast("일정이 삭제되었습니다. (로컬)");
    }
  };

  return (
    <div className="calendar-page">
      <FamilyNote />

      <section className="calendar-section">
        <div className="calendar-header">
          <div className="month-selector">
            <h2>2026년 5월</h2>
            <div className="month-arrows">
              <button className="icon-btn"><ChevronLeft size={24} /></button>
              <button className="icon-btn"><ChevronRight size={24} /></button>
            </div>
          </div>
          <button className="add-event-btn" onClick={() => {
            const todayStr = `2026-05-${String(new Date().getDate()).padStart(2, '0')}T12:00`;
            setSelectedEvent({ defaultDate: todayStr });
            setModalMode('create');
            setIsModalOpen(true);
          }}>
            <Plus size={20} /> 일정 추가
          </button>
        </div>

        <div className="calendar-grid">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
          
          {totalSlots.map((day, index) => {
            const today = new Date();
            const isToday = day && 
                            today.getFullYear() === 2026 && 
                            (today.getMonth() + 1) === 5 && 
                            today.getDate() === day;

            const dateStr = day ? `2026-05-${String(day).padStart(2, '0')}` : '';
            const dayEvents = events.filter(e => e.startDate.startsWith(dateStr));

            return (
              <div 
                key={index} 
                className={`day-cell ${day ? '' : 'empty'} ${isToday ? 'today' : ''}`}
                onClick={() => day && handleDateClick(day)} 
                style={{ cursor: day ? 'pointer' : 'default' }}
              >
                {day && (
                  <>
                    <span className="day-number">{day}</span>
                    <div className="event-badge-container" style={{ width: '100%', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {dayEvents.map(ev => (
                        <div 
                          key={ev.id}
                          className="event-badge" 
                          style={{ backgroundColor: ev.color, fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            setSelectedEvent(ev);
                            setModalMode('detail');
                            setIsModalOpen(true);
                          }}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <CalendarModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedEvent}
        onSubmit={handleModalSubmit}
        onDelete={handleEventDelete}
        members={familyMembers}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Calendar;