import React, { useState, useEffect } from 'react';
import ErrorMessage from '../components/ErrorMessage'; 
import './Calendar.css'; 

const CalendarModal = ({ isOpen, onClose, mode, initialData, onSubmit, onDelete, members, currentUser }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [error, setError] = useState('');

  const [internalMode, setInternalMode] = useState(mode);

  useEffect(() => {
    setInternalMode(mode);
    if ((mode === 'edit' || mode === 'detail') && initialData) {
      setTitle(initialData.title || '');
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setMemo(initialData.memo || '');
      setSelectedParticipants(initialData.participants || []);
    } else {
      const defaultDate = initialData?.defaultDate || '2026-05-19T12:00';
      setTitle('');
      setStartDate(defaultDate);
      setEndDate(defaultDate);
      setMemo('');
      setSelectedParticipants([]);
    }
    setError('');
  }, [mode, initialData, isOpen]);

  if (!isOpen) return null;

  const handleParticipantToggle = (nickname) => {
    if (selectedParticipants.includes(nickname)) {
      setSelectedParticipants(selectedParticipants.filter(p => p !== nickname));
    } else {
      setSelectedParticipants([...selectedParticipants, nickname]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || title.length > 20) {
      setError('제목은 1자 이상 20자 이내로 입력해주세요.');
      return;
    }

    const finalParticipants = selectedParticipants.length === 0 
      ? [internalMode === 'edit' ? initialData.writer : currentUser] 
      : selectedParticipants;

    const eventPayload = {
      id: internalMode === 'edit' ? initialData.id : Date.now(),
      title: title.trim(),
      startDate,
      endDate,
      memo: memo.slice(0, 100), 
      writer: internalMode === 'edit' ? initialData.writer : currentUser,
      participants: finalParticipants
    };

    onSubmit(eventPayload);
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return '';
    const [date, time] = dtStr.split('T');
    const [y, m, d] = date.split('-');
    const [hh, mm] = time.split(':');
    return `${y}년 ${m}월 ${d}일 ${hh}시 ${mm}분`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* 1️⃣ 상세 조회 모드 */}
        {internalMode === 'detail' && initialData && (
          <div>
            <h2>일정 상세 조회</h2>

            <div className="form-field">
              <label>일정 제목</label>
              <div className="read-only-box">{initialData.title}</div>
            </div>

            <div className="form-field" style={{ marginTop: '16px' }}>
              <label>시작 시간</label>
              <div className="read-only-box">{formatDateTime(initialData.startDate)}</div>
            </div>

            <div className="form-field" style={{ marginTop: '16px' }}>
              <label>종료 시간</label>
              <div className="read-only-box">{formatDateTime(initialData.endDate)}</div>
            </div>

            <div className="form-field" style={{ marginTop: '16px' }}>
              <label>메모</label>
              <div className="read-only-box" style={{ minHeight: '74px' }}>
                {initialData.memo || '작성된 메모가 없습니다.'}
              </div>
            </div>

            <div className="form-field" style={{ marginTop: '16px' }}>
              <label>참여 멤버 (작성자: {initialData.writer})</label>
              <div className="member-select-container">
                {(initialData.participants || []).map(p => (
                  <button key={p} type="button" className="member-btn selected" style={{ cursor: 'default' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="btn-group">
              <button type="button" className="btn btn-danger" onClick={() => onDelete(initialData.id)}>삭제</button>
              <button type="button" className="btn btn-primary" onClick={() => setInternalMode('edit')}>수정</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>닫기</button>
            </div>
          </div>
        )}

        {(internalMode === 'create' || internalMode === 'edit') && (
          <div>
            <h2>{internalMode === 'edit' ? '일정 수정' : '일정 등록'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-field">
                <label>일정 제목</label>
                <input 
                  type="text" placeholder="1~20자 이내 (필수)" maxLength={20} required
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  className={error ? 'input-error' : ''}
                />
              </div>

              <div className="form-field" style={{ marginTop: '16px' }}>
                <label>시작 시간</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>

              <div className="form-field" style={{ marginTop: '16px' }}>
                <label>종료 시간</label>
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>

              <div className="form-field" style={{ marginTop: '16px' }}>
                <label>메모</label>
                <textarea 
                  placeholder="100자 이내로 입력해주세요" maxLength={100} rows={3}
                  value={memo} onChange={(e) => setMemo(e.target.value)}
                />
              </div>

              <div className="form-field" style={{ marginTop: '16px' }}>
                <label>참여 멤버 (미선택 시 자동 포함)</label>
                <div className="member-select-container">
                  {(members || []).map(m => (
                    <button
                      key={m}
                      type="button" 
                      className={`member-btn ${selectedParticipants.includes(m) ? 'selected' : ''}`}
                      onClick={() => handleParticipantToggle(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <ErrorMessage message={error} />

              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
                <button type="submit" className="btn btn-primary">저장하기</button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default CalendarModal;