import React, { useState, useEffect } from 'react';
import { iconList, colorList } from '../constants/profileOptions'; // 🚨 iconList, colorList로 통일
import axios from 'axios';
import './css/FamilyNote.css';

const FamilyNote = () => {
  const now = new Date();

  const [familyNotes, setFamilyNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState('');

  // 공통 헤더 생성 함수 (토큰 + 슬롯 ID)
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    const profileId = localStorage.getItem('currentSlotId');
    return { 
      headers: { 
        Authorization: `Bearer ${token}`, 
        'X-Profile-Id': profileId // 🚨 필수 헤더 추가!
      } 
    };
  };

  // 백엔드에서 전체 가족 노트 불러오기 (GET)
  const fetchFamilyNotes = async () => {
    try {
      const response = await axios.get('/api/moods', getAuthHeaders());
      const currentSlotId = Number(localStorage.getItem('currentSlotId'));

      const mappedNotes = response.data.map(mood => ({
        id: mood.slotId || mood.id, // DTO 변수명 유연성 확보
        name: mood.nickname,
        nickname: mood.nickname,
        // 다른 페이지와 완벽히 통일된 아바타 데이터 매핑
        profile_type: mood.customProfileImage ? 1 : 0, 
        emoji_id: mood.profileEmoji || mood.emojiId || 0,
        background_id: mood.profileBackground || mood.backgroundId || 0,
        custom_profile_image: mood.customProfileImage,
        note: mood.content || mood.moodText, // 기분이 없으면 null로 들어옴
        noteUpdatedAt: mood.createdAt,
        lastLogin: mood.lastAccessTime,
        isCurrentUser: (mood.slotId || mood.id) === currentSlotId 
      }));

      // 내 슬롯이 무조건 배열의 맨 첫 번째(왼쪽 끝)에 오도록 정렬
      const sortedNotes = mappedNotes.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        return 0;
      });

      setFamilyNotes(sortedNotes);
    } catch (error) {
      console.error("가족 노트 조회 실패:", error);
      // 에러가 났을 때만 빈 배열 처리 (더미 데이터 삭제)
      setFamilyNotes([]);
    }
  };

  useEffect(() => {
    fetchFamilyNotes();
  }, []);

  const isInactiveFor7Days = (lastLoginIso) => {
    if (!lastLoginIso) return false;
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

  // 백엔드에 내 노트 전송 및 저장 (POST)
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (newNote.trim().length < 1 || newNote.trim().length > 20) {
      setError('오늘의 한줄은 1자 이상 20자 이내로 입력해주세요.');
      return;
    }

    try {
      // getAuthHeaders()를 사용하여 X-Profile-Id 헤더도 함께 전송
      await axios.post('/api/moods', { content: newNote.trim() }, getAuthHeaders());
      
      fetchFamilyNotes(); // 저장 성공 시 화면 새로고침
      setIsModalOpen(false);
    } catch (error) {
      console.error("노트 저장 실패:", error);
      // 에러 침묵 현상 방지
      const errorMsg = error.response?.data?.message || "기분 등록에 실패했습니다.";
      alert(errorMsg);
    }
  };

  // 아바타 렌더링 통일 (사진 업로드, 배경색 모두 지원)
  const renderAvatar = (member) => {
    if (member.profile_type === 1 && member.custom_profile_image) {
      return (
        <img 
          src={member.custom_profile_image}
          alt={member.nickname} 
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
        />
      );
    }
    return (
      <div style={{ 
        width: '100%', height: '100%', borderRadius: '50%', 
        backgroundColor: colorList[member.background_id] || '#e0e0e0',
        overflow: 'hidden'
      }}>
        <img 
          src={iconList[member.emoji_id] || iconList[0]} 
          alt={member.nickname} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>
    );
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
                {/* 개선된 아바타 렌더링 적용 */}
                {renderAvatar(member)}
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