import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import FamilyNote from '../components/FamilyNote'; 
import CalendarModal from './CalendarModal';
import CalendarListModal from './CalendarListModal';
import './Calendar.css';

const MOCK_EVENTS = [
  { id: 1, title: '엄마 생일', startDate: '2026-05-15T10:00', endDate: '2026-05-15T22:00', memo: '가족 외식 예정', writer: '엄마', participants: ['엄마', '아빠', '딸', '아들'], color: '#E6F0E7' },
  { id: 2, title: '딸 학원 상담', startDate: '2026-05-18T17:00', endDate: '2026-05-18T18:00', memo: '성적표 지참', writer: '아빠', participants: ['아빠', '딸'], color: '#FFF3CD' },
  { id: 3, title: '가족 외식', startDate: '2026-05-20T19:00', endDate: '2026-05-20T21:00', memo: '예약 확인하기', writer: '엄마', participants: ['엄마', '아빠', '딸', '아들'], color: '#FDECE8' }
];

const Calendar = ({ currentProfile, showToast }) => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [currentUserSlotId, setCurrentUserSlotId] = useState(null);

  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState('');

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
    fetchFamilyMembers();
    setCurrentUserSlotId(Number(localStorage.getItem('currentSlotId'))); // Account.jsx에서 저장했던 내 ID
  }, [currentDate]);

  const fetchFamilyMembers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/slots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 백엔드에서 받은 정보 중 id와 닉네임만 추출
      setFamilyMembers(response.data.map(slot => ({
        slotId: slot.slotId,
        nickname: slot.nickname
      })));
    } catch (error) {
      console.error("가족 목록 불러오기 실패:", error);
    }
  };

  const fetchEvents = async (fetchYear, fetchMonth) => {
    try {
      const token = localStorage.getItem('accessToken');
      const currentSlotId = localStorage.getItem('currentSlotId');
      const response = await axios.get(`/api/calendars?year=${fetchYear}&month=${fetchMonth}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-Profile-Id': currentSlotId // 조회 시에도 헤더 추가
        }
      });

      const colors = ['#E6F0E7', '#FFF3CD', '#FDECE8', '#E3F2FD', '#F3E5F5'];
      const mappedEvents = response.data.map((event, index) => ({
        id: event.calendarId,
        title: event.title,
        startDate: event.startDateTime,
        endDate: event.endDateTime,
        color: colors[index % colors.length] 
      }));
      
      setEvents(mappedEvents);
    } catch (error) {
      console.error("일정 불러오기 실패:", error);
      if (fetchYear === 2026 && fetchMonth === 5) {
        setEvents(MOCK_EVENTS); 
      } else {
        setEvents([]); 
      }
    }
  };

  const openEventDetail = async (eventId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const currentSlotId = localStorage.getItem('currentSlotId');

      const response = await axios.get(`/api/calendars/${eventId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'X-Profile-Id': currentSlotId 
        }
      });

      setSelectedEvent({
        id: response.data.calendarId,
        title: response.data.title,
        startDate: response.data.startDateTime,
        endDate: response.data.endDateTime,
        memo: response.data.memo,
        writer: response.data.uploaderNickname,
        participantNicknames: response.data.participants.map(p => p.nickname), 
        participants: response.data.participants.map(p => p.slotId)            
      });
      
      setModalMode('detail');
      setIsModalOpen(true);
    } catch (error) {
      const errorMsg = error.response?.data?.message || '일정을 불러올 수 없습니다.';
      alert(errorMsg); 
      fetchEvents(year, month);
    }
  };

  const openDayList = (clickedDateStr) => {
    // 해당 날짜에 걸쳐있는 모든 일정 필터링
    const dayEvents = events.filter(e => {
      if (!e.startDate || !e.endDate) return false;
      const startStr = e.startDate.substring(0, 10);
      const endStr = e.endDate.substring(0, 10);
      return clickedDateStr >= startStr && clickedDateStr <= endStr;
    });

    setSelectedDateEvents(dayEvents);
    setSelectedDateStr(clickedDateStr);
    setIsListModalOpen(true); // 리스트 모달 오픈
  };

  // 2. 날짜 클릭 (배경)
  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    openDayList(clickedDateStr);
  };

  // 3. 일정 배지 클릭
  const handleEventClick = (e, ev) => {
    e.stopPropagation();
    // 배지를 눌러도 해당 날짜의 리스트 모달을 엶
    const dateStr = ev.startDate.substring(0, 10);
    openDayList(dateStr);
  };

  const handleModalSubmit = async (eventData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const currentSlotId = localStorage.getItem('currentSlotId'); // 저장해둔 현재 내 슬롯 번호 꺼내기

      // 'X-Profile-Id' 헤더 추가 (일정 작성 슬롯 PK)
      const headers = { 
        Authorization: `Bearer ${token}`,
        'X-Profile-Id': currentSlotId
      };

      // 서버 Request DTO 스펙에 맞춘 페이로드 생성
      const backendPayload = {
        title: eventData.title,
        startDateTime: eventData.startDate,
        endDateTime: eventData.endDate,
        memo: eventData.memo || '',
        participantSlotIds: eventData.participantSlotIds || [] 
      };

      if (modalMode === 'create') {
        await axios.post('/api/calendars', backendPayload, { headers });
        if (showToast) showToast("새 일정이 등록되었어요! 🗓️");

      } else if (modalMode === 'edit' || modalMode === 'detail') {
        await axios.put(`/api/calendars/${eventData.id}`, backendPayload, { headers });
        if (showToast) showToast("일정 수정이 완료되었습니다.");
      }
      setIsModalOpen(false);
      
      // 조회 호출
      fetchEvents(year, month);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "일정 저장에 실패했습니다.";
      alert(errorMsg);
    }
  };

  const handleEventDelete = async (eventId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/calendars/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEvents(events.filter(e => e.id !== eventId));
      setIsModalOpen(false);
      if (showToast) showToast("일정이 정상적으로 삭제되었습니다.");

    } catch (error) {
      const errorMsg = error.response?.data?.message || "일정 삭제 권한이 없거나 실패했습니다.";
      alert(errorMsg);
    }
  };

  return (
    <div className="calendar-page">
      <FamilyNote currentProfile={currentProfile} />

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
            const dateStr = day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
            const dayEvents = events.filter(e => {
              if (!e.startDate || !e.endDate || !dateStr) return false;
              return dateStr >= e.startDate.substring(0, 10) && dateStr <= e.endDate.substring(0, 10);
            });

            return (
              <div 
                key={index} 
                className={`day-cell ${day ? '' : 'empty'} ${day && new Date().toDateString() === new Date(year, month-1, day).toDateString() ? 'today' : ''}`}
                onClick={() => day && handleDateClick(day)} 
                style={{ cursor: day ? 'pointer' : 'default' }}
              >
                {day && (
                  <>
                    <span className="day-number">{day}</span>
                    <div className="event-badge-container" style={{ width: '100%', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {dayEvents.slice(0, 1).map(ev => (
                        <div key={ev.id} className="event-badge" style={{ backgroundColor: ev.color, fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px' }}>
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 1 && (
                      <div 
                        className="event-badge more-badge" 
                        style={{ 
                          backgroundColor: '#f1f3f5', 
                          fontSize: '0.7rem', 
                          textAlign: 'center', 
                          borderRadius: '4px',
                          padding: '0px 2px',      /* padding을 0에 가깝게 줄임 */
                          lineHeight: '1',         /* 줄 높이를 1로 고정하여 불필요한 위아래 여백 제거 */
                          cursor: 'pointer',
                          display: 'flex',         /* flex를 사용하여 */
                          alignItems: 'center',    /* 중앙 정렬 강제 */
                          justifyContent: 'center',
                          height: '14px'           /* 높이를 명시적으로 줄임 */
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateClick(day);
                        }}
                      >
                        +{dayEvents.length - 1}
                      </div>
                    )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 일정 상세 조회 모달 */}
      <CalendarModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedEvent}
        onSubmit={handleModalSubmit}
        onDelete={handleEventDelete}
        members={familyMembers}
        currentUserSlotId={currentUserSlotId}
      />

      {/* 리스트 모달 */}
      <CalendarListModal 
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        date={selectedDateStr}
        events={selectedDateEvents}
        onEventClick={(ev) => {
            setIsListModalOpen(false); // 리스트 닫고
            openEventDetail(ev.id);    // 상세 모달 열기
        }}
        onAddEvent={() => {
            setIsListModalOpen(false);
            setSelectedEvent({ defaultDate: `${selectedDateStr}T12:00` });
            setModalMode('create');
            setIsModalOpen(true);
        }}
      />
    </div>
  );
};

export default Calendar;