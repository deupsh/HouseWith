import React, { useState, useEffect } from 'react';
import { iconMap } from '../constants/profileOptions';
import axios from 'axios';
import './css/FamilyNote.css';

// 🚨 백엔드 연결 전 UI 테스트용 가짜 데이터 (로딩 시 에러 나면 보여줄 용도)
const MOCK_NOTES = [
  { id: 1, name: '나(엄마)', nickname: '엄마', avatar: 1, note: '냉장고에 과일 깎아뒀으니 다들 챙겨 먹어~ 🍎', noteUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), lastLogin: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isCurrentUser: true },
  { id: 2, name: '아빠', nickname: '아빠', avatar: 2, note: '오늘 야근 확정...', noteUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), isCurrentUser: false },
  { id: 3, name: '딸', nickname: '딸', avatar: 3, note: '이번 주말에 친구들이랑 놀이공원 갈래! 🎢', noteUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), isCurrentUser: false },
  { id: 4, name: '아들', nickname: '아들', avatar: 4, note: '아 피곤해... 오늘 학원 쉬고 싶다 😪', noteUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), isCurrentUser: false },
];

const FamilyNote = () => {
  const now = new Date();

  // API로 채울 예정
  const [familyNotes, setFamilyNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState('');

  // 백엔드에서 전체 가족 노트 불러오기 (GET)
  const fetchFamilyNotes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // 오늘의 가족 기분 조회
      const response = await axios.get('/api/moods', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 현재 접속 중인 내 슬롯 ID를 가져오기 (Account.jsx에서 저장해둬야 함)
      const currentSlotId = Number(localStorage.getItem('currentSlotId'));

      // 백엔드 MoodResponse DTO에 맞춰 프론트엔드 변수명으로 매핑
      const mappedNotes = response.data.map(mood => ({
        id: mood.slotId,
        name: mood.nickname,
        nickname: mood.nickname,
        avatar: mood.profileEmoji, // 이모지 매핑
        note: mood.content,        // 백엔드는 content, 프론트는 note
        noteUpdatedAt: mood.createdAt,
        lastLogin: mood.lastAccessTime,
        isCurrentUser: mood.slotId === currentSlotId // 내가 누군지 판별
      }));

      setFamilyNotes(mappedNotes);
    } catch (error) {
      console.error("가족 노트 조회 실패:", error);
      setFamilyNotes(MOCK_NOTES);
    }
  };

  // 컴포넌트 렌더링 시 최초 1회 노트 목록 가져오기
  useEffect(() => {
    fetchFamilyNotes();
  }, []);

  const isInactiveFor7Days = (lastLoginIso) => {
    const loginDate = new Date(lastLoginIso);
    const diffTime = Math.abs(now - loginDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  };

  const isNoteValid = (updatedAtIso) => {
    if (!updatedAtIso) return false;
    const updatedDate = new Date(updatedAtIso);
    const diffTime = Math.abs(now - updatedDate);
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const handleSlotClick = (member) => {
    if (member.isCurrentUser) {
      setNewNote(isNoteValid(member.noteUpdatedAt) ? member.note : '');
      setError('');
      setIsModalOpen(true);
    }
  };

  //백엔드에 내 노트 전송 및 저장 (PUT)
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (newNote.trim().length < 1 || newNote.trim().length > 20) {
      setError('오늘의 한줄은 1자 이상 20자 이내로 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // 오늘의 기분 작성 (POST /api/moods)
      // MoodCreateRequest DTO에 맞춰 'note'가 아닌 'content'로 전송
      await axios.post('/api/moods', { content: newNote.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchFamilyNotes();
      setIsModalOpen(false);

    } catch (error) {
      console.error("노트 저장 실패:", error);
      setIsModalOpen(false);
    }
  };

  const getAvatarImage = (avatarId) => {
    return iconMap[String(avatarId)] || iconMap['1'];
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
              <div className="avatar-large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={getAvatarImage(member.avatar)} 
                  alt={`${member.nickname} profile`} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                />
              </div>
              <strong className="member-name">{member.name}</strong>
              
              <div 
                className={`note-bubble ${isInactive ? 'nudge-bubble' : ''} ${!showNote && !isInactive && member.isCurrentUser ? 'empty-bubble' : ''} ${member.isCurrentUser ? 'editable-bubble' : ''}`}
                onClick={() => handleSlotClick(member)}
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