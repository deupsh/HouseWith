import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import FamilyNote from '../components/FamilyNote'; 
import CalendarModal from './CalendarModal';
import './Calendar.css';

const MOCK_EVENTS = [
  { id: 1, title: '엄마 생일', startDate: '2026-05-15T10:00', endDate: '2026-05-15T22:00', memo: '가족 외식 예정', writer: '엄마', participants: ['엄마', '아빠', '딸', '아들'], color: '#E6F0E7' },
  { id: 2, title: '딸 학원 상담', startDate: '2026-05-18T17:00', endDate: '2026-05-18T18:00', memo: '성적표 지참', writer: '아빠', participants: ['아빠', '딸'], color: '#FFF3CD' },
  { id: 3, title: '가족 외식', startDate: '2026-05-20T19:00', endDate: '2026-05-20T21:00', memo: '예약 확인하기', writer: '엄마', participants: ['엄마', '아빠', '딸', '아들'], color: '#FDECE8' }
];

const Calendar = ({ showToast }) => {
  const currentUser = '엄마';
  const familyMembers = ['엄마', '아빠', '딸', '아들'];

  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 현재 보고 있는 연도와 월을 상태(State)로 관리
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const totalSlots = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  // 이전 달, 다음 달 이동 함수
  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));

  useEffect(() => {
    fetchEvents(year, month);
  }, [currentDate]);

  const fetchEvents = async (fetchYear, fetchMonth) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/calendar/events?year=${fetchYear}&month=${fetchMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error("일정 불러오기 실패:", error);
      if (fetchYear === 2026 && fetchMonth === 5) {
        setEvents(MOCK_EVENTS); 
      } else {
        setEvents([]); 
      }
    }
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

  const handleModalSubmit = async (eventData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      if (modalMode === 'create') {
        const colors = ['#E6F0E7', '#FFF3CD', '#FDECE8', '#E3F2FD', '#F3E5F5'];
        const randomColor = colors[events.length % colors.length];
        const newEventPayload = { ...eventData, color: randomColor };

        const response = await axios.post('/api/calendar/events', newEventPayload, { headers });
        setEvents([...events, response.data]); 
        if (showToast) showToast("새 일정이 등록되었어요! 🗓️");

      } else if (modalMode === 'edit') {
        const response = await axios.put(`/api/calendar/events/${eventData.id}`, eventData, { headers });
        setEvents(events.map(e => e.id === eventData.id ? response.data : e));
        if (showToast) showToast("일정 수정이 완료되었습니다.");
      }
      setIsModalOpen(false);

    } catch (error) {
      console.error("일정 저장 실패:", error);
      
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

  const handleEventDelete = async (eventId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/calendar/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEvents(events.filter(e => e.id !== eventId));
      setIsModalOpen(false);
      if (showToast) showToast("일정이 정상적으로 삭제되었습니다.");

    } catch (error) {
      console.error("일정 삭제 실패:", error);
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
            <h2>{year}년 {month}월</h2>
            <div className="month-arrows">
              <button className="icon-btn" onClick={prevMonth}><ChevronLeft size={24} /></button>
              <button className="icon-btn" onClick={nextMonth}><ChevronRight size={24} /></button>
            </div>
          </div>
          <button className="add-event-btn" onClick={() => {
            const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}T12:00`;
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
                            today.getFullYear() === year && 
                            (today.getMonth() + 1) === month && 
                            today.getDate() === day;

            const dateStr = day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
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