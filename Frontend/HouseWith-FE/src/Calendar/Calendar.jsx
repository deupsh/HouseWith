import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import FamilyNote from '../components/FamilyNote'; 
import CalendarModal from './CalendarModal';
import './Calendar.css';

const Calendar = ({ showToast }) => {
  // 현재 접속 중인 사용자 (기본 작성자) 및 가족 멤버 리스트
  const currentUser = '엄마';
  const familyMembers = ['엄마', '아빠', '딸', '아들'];

  //  1. 이벤트를 상세 정보를 담은 배열(상태)로 변경
  const [events, setEvents] = useState([
    { id: 1, title: '엄마 생일', startDate: '2026-05-15T10:00', endDate: '2026-05-15T22:00', memo: '가족 외식 예정', writer: '엄마', participants: ['엄마', '아빠', '딸', '아들'], color: '#E6F0E7' },
    { id: 2, title: '딸 학원 상담', startDate: '2026-05-18T17:00', endDate: '2026-05-18T18:00', memo: '성적표 지참', writer: '아빠', participants: ['아빠', '딸'], color: '#FFF3CD' },
    { id: 3, title: '가족 외식', startDate: '2026-05-20T19:00', endDate: '2026-05-20T21:00', memo: '예약 확인하기', writer: '엄마', participants: ['엄마', '아빠', '딸', '아들'], color: '#FDECE8' }
  ]);

  //  2. 모달 제어용 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'detail', 'edit'
  const [selectedEvent, setSelectedEvent] = useState(null);

  const daysInMonth = 31;
  const firstDayOfMonth = 5; 
  const totalSlots = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  //  3. 날짜 클릭 핸들러 (상세 조회 또는 등록 모달 띄우기)
  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDateStr = `2026-05-${String(day).padStart(2, '0')}`;
    
    // 해당 날짜에 일정이 있는지 확인
    const dayEvent = events.find(e => e.startDate.startsWith(clickedDateStr));

    if (dayEvent) {
      setSelectedEvent(dayEvent);
      setModalMode('detail'); // 일정이 있으면 상세조회 모드
    } else {
      setSelectedEvent({ defaultDate: `${clickedDateStr}T12:00` });
      setModalMode('create'); // 일정이 없으면 등록 모드
    }
    setIsModalOpen(true);
  };

  //  4. 일정 저장 핸들러 (등록 & 수정)
  const handleModalSubmit = (eventData) => {
    if (modalMode === 'create') {
      const colors = ['#E6F0E7', '#FFF3CD', '#FDECE8', '#E3F2FD', '#F3E5F5'];
      const randomColor = colors[events.length % colors.length];
      setEvents([...events, { ...eventData, color: randomColor }]);
      if (showToast) showToast("새 일정이 등록되었어요! 🗓️");
    } else if (modalMode === 'edit') {
      setEvents(events.map(e => e.id === eventData.id ? { ...e, ...eventData } : e));
      if (showToast) showToast("일정 수정이 완료되었습니다.");
    }
    setIsModalOpen(false);
  };

  //  5. 일정 삭제 핸들러
  const handleEventDelete = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
    setIsModalOpen(false);
    if (showToast) showToast("일정이 정상적으로 삭제되었습니다.");
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
            // 상단 '일정 추가' 버튼 클릭 시 오늘 날짜 기준으로 모달 열기
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

            //  6. 달력 칸에 맞는 일정 필터링
            const dateStr = day ? `2026-05-${String(day).padStart(2, '0')}` : '';
            const dayEvents = events.filter(e => e.startDate.startsWith(dateStr));

            return (
              <div 
                key={index} 
                className={`day-cell ${day ? '' : 'empty'} ${isToday ? 'today' : ''}`}
                onClick={() => day && handleDateClick(day)} // 빈 칸 클릭 방지
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
                            e.stopPropagation(); // 부모(달력 칸) 클릭 이벤트 무시
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

      {/*  7. 모달 컴포넌트 부착 */}
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