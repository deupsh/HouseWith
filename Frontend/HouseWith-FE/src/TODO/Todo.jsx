import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { iconList, colorList } from '../constants/profileOptions';
import './Todo.css';

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  const profileId = localStorage.getItem('currentSlotId');
  return { headers: { Authorization: `Bearer ${token}`, 'X-Profile-Id': profileId } };
};

const Todo = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todos, setTodos] = useState();
  const [familyMembers, setFamilyMembers] = useState([]);

  // 데이터 불러오기
  const fetchChores = async () => {
    try {
      const response = await axios.get(`/api/chores?date=${selectedDate}`, getAuthHeaders());
      if (Array.isArray(response.data)) {
        setTodos(response.data);
      } else {
        console.warn("데이터가 배열이 아닙니다. 빈 배열로 처리합니다.", response.data);
        setTodos([]); 
      }
    } catch (error) {
      console.error("데이터 조회 실패 (서버가 닫혀있을 수 있습니다):", error);
      setTodos([]);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const response = await axios.get('/api/slots', getAuthHeaders());
      
      const members = response.data.map(slot => ({
        slotId: slot.slotId,
        nickname: slot.nickname,
        profileEmoji: slot.profileEmoji, 
        profileBackground: slot.profileBackground,
        customProfileImage: slot.customProfileImage,
        profile_type: slot.customProfileImage ? 1 : 0
      }));
      
      setFamilyMembers(members);
    } catch (error) {
      console.error("가족 목록 불러오기 실패:", error);
    }
  };

  // 날짜가 바뀔 때마다 데이터 다시 로드
  useEffect(() => {
    fetchChores();
  }, [selectedDate]);

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [cycleType, setCycleType] = useState(0); 
  const [scheduledDate, setScheduledDate] = useState(''); 
  const [participantSlotIds, setParticipantSlotIds] = useState([]);
  const [error, setError] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  const getAvatar = (member) => {
    // 1. 데이터가 'profileType'으로 오든 'profile_type'으로 오든 둘 다 확인
    const pType = member.profileType !== undefined ? member.profileType : member.profile_type;
    
    // 1. 프로필 사진이 있는 경우 (타입이 1)
    if (pType === 1) {
      return (
        <img 
          src={member.customProfileImage}
          alt={member.nickname} 
          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
        />
      );
    }

    // 2. 사진 없는 경우
    const imageSrc = iconList[Number(member.profileEmoji)] || iconList[0]; 
    const bgColor = colorList[member.profileBackground] || '#e0e0e0'; 

    return (
      <div style={{ 
        display: 'inline-block', width: '24px', height: '24px', 
        backgroundColor: bgColor, borderRadius: '50%', 
        overflow: 'hidden'
      }}>
        <img 
          src={imageSrc} 
          alt="emoji" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>
    );
  };

  const handleToggleComplete = async (id) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) {
      alert("집안일 완료 체크는 오늘 날짜에만 가능합니다.");
      return;
    }
    // 1. 화면에서 먼저 상태를 반전시켜 아래(혹은 위)로 보냄
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.choreId === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );

    try {
      // 2. 서버에 완료 요청을 보냅니다.
      await axios.patch(`/api/chores/${id}/done`, {}, getAuthHeaders());

    } catch (error) {
      console.error("완료 처리 실패:", error);
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.choreId === id ? { ...todo, isDone: !todo.isDone } : todo
        )
      );
      alert("완료 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteClick = (id) => {
    setTodoToDelete(id);
    setIsConfirmOpen(true);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/chores/${todoToDelete}`, getAuthHeaders());
      fetchChores(); // 삭제 후 목록 갱신
      setIsConfirmOpen(false);
      setTodoToDelete(null);
    } catch (error) {
      console.error("삭제 실패:", error);
      // 유저에게 에러 상황 알림 (프론트 자체 메시지 활용)
      alert("집안일 삭제 권한이 없거나 서버 통신에 실패했습니다."); 
      
      // 모달이 무한 로딩 상태처럼 보이지 않도록 닫아줌
      setIsConfirmOpen(false);
      setTodoToDelete(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setCycleType(0);
    setScheduledDate('');
    setParticipantSlotIds([]);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (todo) => {
    setEditingId(todo.choreId);
    setTitle(todo.title);
    setCycleType(todo.cycleType);
    setScheduledDate(todo.scheduledDate !== null ? todo.scheduledDate : '');
    setParticipantSlotIds(todo.participants.map(p => p.slotId));
    setError('');
    setIsModalOpen(true);
  };

  const handleAssigneeToggle = (slotId) => {
    if (participantSlotIds.includes(slotId)) {
      setParticipantSlotIds(participantSlotIds.filter(id => id !== slotId));
    } else {
      setParticipantSlotIds([...participantSlotIds, slotId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.trim().length < 1 || title.trim().length > 20) {
      setError('제목은 1~20자 이내로 입력해주세요.');
      return;
    }
    if (participantSlotIds.length === 0) {
      setError('담당자를 1명 이상 선택해주세요.');
      return;
    }

    const requestPayload = {
      title: title.trim(),
      cycleType: Number(cycleType),
      scheduledDate: (cycleType === 0 || cycleType === 1) ? null : Number(scheduledDate),
      participantSlotIds: participantSlotIds.map(Number)
    };

    try {
      if (editingId) {
        await axios.put(`/api/chores/${editingId}`, requestPayload, getAuthHeaders());
      } else {
        await axios.post('/api/chores', requestPayload, getAuthHeaders());
      }
      setIsModalOpen(false);
      fetchChores(); // 저장 후 목록 갱신
    } catch (error) {
      console.error("집안일 저장 실패:", error);
      setError('서버 통신 중 오류가 발생했습니다.');
    }
  };

  const getCycleText = (type, value) => {
    if (type === 0) return '일회성';
    if (type === 1) return '매일';
    if (type === 2) return `매주 ${WEEK_DAYS[value]}요일`;
    if (type === 3) return `격주 ${WEEK_DAYS[value]}요일`;
    if (type === 4) return `매월 ${value}일`;
    return '';
  };

  const todoList = Array.isArray(todos) ? todos : [];
  const inProgressTodos = todoList.filter(t => !t.isDone);
  const completedTodos = todoList.filter(t => t.isDone);

  return (
    <div className="todo-page">
      <div className="todo-header">
        <h2>오늘의 집안일</h2>
        <input 
          type="date" 
          className="date-selector"
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="todo-list-section">
        <h3>진행 중 ({inProgressTodos.length})</h3>
        {inProgressTodos.length === 0 && <p className="empty-msg">진행 중인 집안일이 없습니다.</p>}
        {inProgressTodos.map(todo => (
          <div key={todo.choreId} className="todo-item">
            <input 
              type="checkbox" 
              className="todo-check" 
              checked={todo.isDone}
              disabled={selectedDate !== new Date().toISOString().split('T')[0]}
              onChange={() => handleToggleComplete(todo.choreId)}
            />
            <div className="todo-info">
              <span className="title">{todo.title}</span>
              <span className="cycle">{getCycleText(todo.cycleType, todo.scheduledDate)}</span>
            </div>
            <div className="todo-assignee">
              {todo.participants.map(member => (
                <span key={member.slotId} title={member.nickname} className="avatar-mini">
                  {getAvatar(member)}
                </span>
              ))}
            </div>
            <div className="todo-actions">
              <button onClick={() => handleOpenEdit(todo)}>✏️</button>
            </div>
          </div>
        ))}
      </div>

      <div className="todo-list-section">
        <h3>완료됨 ({completedTodos.length})</h3>
        {completedTodos.length === 0 && <p className="empty-msg">완료된 집안일이 없습니다.</p>}
        {completedTodos.map(todo => (
          <div key={todo.choreId} className="todo-item completed">
            <input 
              type="checkbox" 
              className="todo-check" 
              checked={todo.isDone}
              disabled={selectedDate !== new Date().toISOString().split('T')[0]}
              onChange={() => handleToggleComplete(todo.choreId)}
            />
            <div className="todo-info">
              <span className="title">{todo.title}</span>
              <span className="cycle">{getCycleText(todo.cycleType, todo.scheduledDate)}</span>
            </div>
            <div className="todo-assignee">
              {todo.participants.map(member => (
                <span key={member.slotId} title={member.nickname} className="avatar-mini">
                  {getAvatar(member)}
                </span>
              ))}
            </div>
            <div className="todo-actions">
              <button onClick={() => handleDeleteClick(todo.choreId)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="add-todo-btn" 
        onClick={handleOpenAdd} 
        style={{ marginTop: '10px' }}
      >
        + 새로운 집안일 추가
      </button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content todo-modal" onClick={e => e.stopPropagation()}>
            <button className="close-icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            <h2>{editingId ? '집안일 수정' : '집안일 추가'}</h2>
            
            <form onSubmit={handleSubmit} className="modal-form-container">
              <div className="form-field">
                <label>어떤 집안일인가요?</label>
                <input type="text" placeholder="예: 거실 청소기 돌리기 (1~20자)" maxLength={20} value={title} onChange={e => setTitle(e.target.value)} autoFocus />
              </div>

              {/* 0~4 숫자 인덱스로 매핑된 반복 주기 */}
              <div className="form-field">
                <label>반복 주기</label>
                <div className="cycle-btn-group">
                  <button type="button" className={`cycle-btn ${cycleType === 0 ? 'selected' : ''}`} onClick={() => { setCycleType(0); setScheduledDate(''); }}>없음</button>
                  <button type="button" className={`cycle-btn ${cycleType === 1 ? 'selected' : ''}`} onClick={() => { setCycleType(1); setScheduledDate(''); }}>매일</button>
                  <button type="button" className={`cycle-btn ${cycleType === 2 ? 'selected' : ''}`} onClick={() => { setCycleType(2); setScheduledDate(0); }}>매주</button>
                  <button type="button" className={`cycle-btn ${cycleType === 3 ? 'selected' : ''}`} onClick={() => { setCycleType(3); setScheduledDate(0); }}>격주</button>
                  <button type="button" className={`cycle-btn ${cycleType === 4 ? 'selected' : ''}`} onClick={() => { setCycleType(4); setScheduledDate(1); }}>매월</button>
                </div>
              </div>

              {/* 매주/격주 일 경우 0(월) ~ 6(일) 데이터 바인딩 */}
              {(cycleType === 2 || cycleType === 3) && (
                <div className="form-field fade-in">
                  <label>요일 선택</label>
                  <div className="member-select-container">
                    {WEEK_DAYS.map((day, idx) => (
                      <button key={idx} type="button" className={`member-btn ${scheduledDate === idx ? 'selected' : ''}`} onClick={() => setScheduledDate(idx)}>{day}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* 매월 일 경우 1~31 데이터 바인딩 */}
              {cycleType === 4 && (
                <div className="form-field fade-in">
                  <label>날짜 선택</label>
                  <select className="date-select" value={scheduledDate} onChange={e => setScheduledDate(Number(e.target.value))}>
                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}일</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 이름 대신 slotId를 관리하도록 변경 */}
              <div className="form-field">
                <label>담당자 선택 (1명 이상)</label>
                <div className="member-select-container">
                  {familyMembers.map(m => (
                    <button 
                      key={m.slotId} 
                      type="button" 
                      className={`member-btn ${participantSlotIds.includes(m.slotId) ? 'selected' : ''}`} 
                      onClick={() => handleAssigneeToggle(m.slotId)}
                    >
                      {getAvatar(m)} {m.nickname}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div style={{ color: '#FF6B6B', fontSize: '0.85rem', fontWeight: 'bold' }}>{error}</div>}

              <div className="btn-group btn-group-two modal-btn-margin">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>저장하기</button>
                
                {editingId && (
                  <button type="button" className="btn btn-danger" onClick={() => handleDeleteClick(editingId)}>삭제</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setIsConfirmOpen(false)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            
            <h3 className="confirm-title" style={{ lineHeight: '1.4' }}>
              <span style={{ color: '#7A9D8C' }}>'{todos.find(t => t.choreId === todoToDelete)?.title}'</span>을(를)<br/>
              삭제하시겠습니까?
            </h3>
            
            <p className="confirm-desc" style={{ marginTop: '12px' }}>삭제된 집안일은 복구할 수 없습니다.</p>
            
            <div className="btn-group" style={{ marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsConfirmOpen(false)}>취소</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>삭제하기</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Todo;