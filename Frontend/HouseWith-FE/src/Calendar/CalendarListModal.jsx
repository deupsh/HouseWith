import React from 'react';
import { X } from 'lucide-react';
import './Calendar.css';

const CalendarListModal = ({ isOpen, onClose, date, events, onEventClick, onAddEvent }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="close-icon-btn" onClick={onClose}>
          <X size={22} />
        </button>
        
        <h2 style={{ marginBottom: '20px' }}>{date} 일정</h2>
        
        <div className="event-list">
          {events.length === 0 ? (
            <p className="no-events">등록된 일정이 없습니다.</p>
          ) : (
            events.map(ev => (
              <div 
                key={ev.id} 
                className="event-list-item" 
                onClick={() => onEventClick(ev)} 
                style={{ backgroundColor: ev.color }}
              >
                {ev.title}
              </div>
            ))
          )}
        </div>
        
        {/* 수정된 버튼 클래스 적용 */}
        <button 
          className="btn btn-primary list-add-btn" 
          onClick={onAddEvent}
        >
          + 새 일정 추가
        </button>
      </div>
    </div>
  );
};

export default CalendarListModal;