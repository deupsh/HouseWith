import React, { useState } from 'react';
import './css/FamilyNote.css';

const FamilyNote = () => {
  // 실제 현재 시간 (테스트 시점)
  const now = new Date();

  // 더미 데이터: 접속 시간과 메모 작성 시간 추가
  const [familyNotes, setFamilyNotes] = useState([
    { id: 1, name: '나(엄마)', nickname: '엄마', avatar: '👩', note: '냉장고에 과일 깎아뒀으니 다들 챙겨 먹어~ 🍎', noteUpdatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), lastLogin: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), isCurrentUser: true },
    // 아빠: 8일 전 접속 (7일 이상 미접속 조건 충족)
    { id: 2, name: '아빠', nickname: '아빠', avatar: '👨', note: '오늘 야근 확정...', noteUpdatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), lastLogin: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8).toISOString(), isCurrentUser: false },
    { id: 3, name: '딸', nickname: '딸', avatar: '👧', note: '이번 주말에 친구들이랑 놀이공원 갈래! 🎢', noteUpdatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(), lastLogin: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), isCurrentUser: false },
    // 아들: 25시간 전 메모 작성 (24시간 경과로 메모 미노출 조건 충족)
    { id: 4, name: '아들', nickname: '아들', avatar: '👦', note: '아 피곤해... 오늘 학원 쉬고 싶다 😪', noteUpdatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 25).toISOString(), lastLogin: new Date(now.getTime() - 1000 * 60 * 60 * 10).toISOString(), isCurrentUser: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState('');

  // 7일 이상 미접속 여부 체크 함수
  const isInactiveFor7Days = (lastLoginIso) => {
    const loginDate = new Date(lastLoginIso);
    const diffTime = Math.abs(now - loginDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  };

  // 🌟 [7_1] 메모가 24시간 이내에 작성되었는지 체크 함수
  const isNoteValid = (updatedAtIso) => {
    if (!updatedAtIso) return false;
    const updatedDate = new Date(updatedAtIso);
    const diffTime = Math.abs(now - updatedDate);
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  // 내 슬롯 클릭 시 모달 열기
  const handleSlotClick = (member) => {
    if (member.isCurrentUser) {
      setNewNote(isNoteValid(member.noteUpdatedAt) ? member.note : '');
      setError('');
      setIsModalOpen(true);
    }
  };

  // [7_1] 메모 저장 처리 (1~20자 조건)
  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (newNote.trim().length < 1 || newNote.trim().length > 20) {
      setError('오늘의 한줄은 1자 이상 20자 이내로 입력해주세요.');
      return;
    }

    setFamilyNotes(prevNotes => 
      prevNotes.map(n => 
        n.isCurrentUser ? { ...n, note: newNote.trim(), noteUpdatedAt: new Date().toISOString() } : n
      )
    );
    setIsModalOpen(false);
  };

  return (
    <section className="note-section">
      <div className="section-header">
        <h2>오늘의 한줄</h2>
        <p className="subtitle">24시간 동안만 보이는 상태 메시지예요</p>
      </div>
      
      <div className="note-cards-container">
        {familyNotes.map((member) => {
          const isInactive = isInactiveFor7Days(member.lastLogin);
          const showNote = isNoteValid(member.noteUpdatedAt) && member.note;
          
          const isOtherEmpty = !member.isCurrentUser && !showNote && !isInactive;

          return (
            <div key={member.id} className={`note-card ${member.isCurrentUser ? 'current-user' : ''}`}>
              <div className="avatar-large">{member.avatar}</div>
              <strong className="member-name">{member.name}</strong>
              
              {/* 🌟 클래스와 스타일 분기 처리 */}
              <div 
                className={`note-bubble ${isInactive ? 'nudge-bubble' : ''} ${!showNote && !isInactive && member.isCurrentUser ? 'empty-bubble' : ''} ${member.isCurrentUser ? 'editable-bubble' : ''}`}
                onClick={() => handleSlotClick(member)}
                // 다른 사람의 빈 말풍선은 카드 높이 유지를 위해 공간은 차지하되 눈에는 안 보이게(hidden) 처리
                style={{ visibility: isOtherEmpty ? 'hidden' : 'visible' }}
              >
                {isInactive ? (
                  <>최근 일주일동안 접속하지 않았어요.<br/><strong>{member.nickname}</strong>에게 연락해보는건 어떨까요?</>
                ) : showNote ? (
                  member.note
                ) : member.isCurrentUser ? (
                  '오늘의 한줄을 남겨주세요'
                ) : (
                  '\u00A0' 
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 모달 부분은 기존과 동일하게 유지 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content note-modal" onClick={(e) => e.stopPropagation()}>
            <h2>오늘의 기분 설정</h2>
            <form onSubmit={handleNoteSubmit}>
              <div className="form-field">
                <label>어떤 기분이나 상태인가요?</label>
                <input 
                  type="text" 
                  placeholder="1~20자 이내로 입력" 
                  maxLength={20} 
                  value={newNote} 
                  onChange={(e) => setNewNote(e.target.value)}
                  autoFocus
                />
              </div>
              {error && <div style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '8px' }}>{error}</div>}
              
              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary">등록하기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default FamilyNote;