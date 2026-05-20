import React, { useState } from 'react';
import './Todo.css';

// 더미 데이터
const MEMBERS = [
  { name: '엄마', avatar: '👩' },
  { name: '아빠', avatar: '👨' },
  { name: '딸', avatar: '👧' },
  { name: '아들', avatar: '👦' }
];
const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const Todo = () => {
  const [todos, setTodos] = useState([
    { id: 1, title: '설거지', cycleType: 'daily', cycleValue: '', assignees: ['엄마', '딸'], isCompleted: false },
    { id: 2, title: '분리수거', cycleType: 'weekly', cycleValue: '수', assignees: ['아빠'], isCompleted: false },
    { id: 3, title: '화장실 청소', cycleType: 'biweekly', cycleValue: '일', assignees: ['아들'], isCompleted: false },
    { id: 4, title: '형광등 교체', cycleType: 'none', cycleValue: '', assignees: ['아빠'], isCompleted: true },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [cycleType, setCycleType] = useState('none');
  const [cycleValue, setCycleValue] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [error, setError] = useState('');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  const getAvatar = (name) => MEMBERS.find(m => m.name === name)?.avatar || '👤';

  const handleToggleComplete = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    ));
  };

  const handleDeleteClick = (id) => {
    setTodoToDelete(id);
    setIsConfirmOpen(true);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoToDelete));
    setIsConfirmOpen(false);
    setTodoToDelete(null);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setCycleType('none');
    setCycleValue('');
    setSelectedAssignees([]);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (todo) => {
    setEditingId(todo.id);
    setTitle(todo.title);
    setCycleType(todo.cycleType);
    setCycleValue(todo.cycleValue);
    setSelectedAssignees(todo.assignees);
    setError('');
    setIsModalOpen(true);
  };

  const handleAssigneeToggle = (name) => {
    if (selectedAssignees.includes(name)) {
      setSelectedAssignees(selectedAssignees.filter(a => a !== name));
    } else {
      setSelectedAssignees([...selectedAssignees, name]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (title.trim().length < 1 || title.trim().length > 20) {
      setError('제목은 1~20자 이내로 입력해주세요.');
      return;
    }
    if (selectedAssignees.length === 0) {
      setError('담당자를 1명 이상 선택해주세요.');
      return;
    }
  
    if ((cycleType === 'weekly' || cycleType === 'biweekly') && !cycleValue) {
      setError('반복할 요일을 선택해주세요.');
      return;
    }
    if (cycleType === 'monthly' && !cycleValue) {
      setError('반복할 날짜를 선택해주세요.');
      return;
    }

    const newTodo = {
      id: editingId || Date.now(),
      title: title.trim(),
      cycleType,
      cycleValue,
      assignees: selectedAssignees,
      isCompleted: false
    };

    if (editingId) {
      setTodos(todos.map(t => t.id === editingId ? { ...t, ...newTodo, isCompleted: t.isCompleted } : t));
    } else {
      setTodos([...todos, newTodo]);
    }

    setIsModalOpen(false);
  };

  const getCycleText = (type, value) => {
    if (type === 'none') return '일회성';
    if (type === 'daily') return '매일';
    if (type === 'weekly') return `매주 ${value}요일`;
    if (type === 'biweekly') return `격주 ${value}요일`;
    if (type === 'monthly') return `매월 ${value}일`;
    return '';
  };

  const inProgressTodos = todos.filter(t => !t.isCompleted);
  const completedTodos = todos.filter(t => t.isCompleted);

  const todayString = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  }).format(new Date());

  return (
    <div className="todo-page">

      <div className="todo-header">
        <h2>오늘의 집안일</h2>
        <p className="date-text">{todayString}</p>
      </div>

      <div className="todo-list-section">
        <h3>진행 중 ({inProgressTodos.length})</h3>
        {inProgressTodos.length === 0 && <p className="empty-msg">진행 중인 집안일이 없습니다.</p>}
        {inProgressTodos.map(todo => (
          <div key={todo.id} className="todo-item">
            <input 
              type="checkbox" 
              className="todo-check" 
              checked={todo.isCompleted}
              onChange={() => handleToggleComplete(todo.id)}
            />
            <div className="todo-info">
              <span className="title">{todo.title}</span>
              <span className="cycle">{getCycleText(todo.cycleType, todo.cycleValue)}</span>
            </div>
            <div className="todo-assignee">
              {todo.assignees.map(name => (
                <span key={name} title={name} className="avatar-mini">{getAvatar(name)}</span>
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
          <div key={todo.id} className="todo-item completed">
            <input 
              type="checkbox" 
              className="todo-check" 
              checked={todo.isCompleted}
              onChange={() => handleToggleComplete(todo.id)}
            />
            <div className="todo-info">
              <span className="title">{todo.title}</span>
              <span className="cycle">{getCycleText(todo.cycleType, todo.cycleValue)}</span>
            </div>
            <div className="todo-assignee">
              {todo.assignees.map(name => (
                <span key={name} title={name} className="avatar-mini">{getAvatar(name)}</span>
              ))}
            </div>
            <div className="todo-actions">
              <button onClick={() => handleDeleteClick(todo.id)}>🗑️</button>
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

              <div className="form-field">
                <label>반복 주기</label>
                <div className="cycle-btn-group">
                  <button type="button" className={`cycle-btn ${cycleType === 'none' ? 'selected' : ''}`} onClick={() => { setCycleType('none'); setCycleValue(''); }}>없음</button>
                  <button type="button" className={`cycle-btn ${cycleType === 'daily' ? 'selected' : ''}`} onClick={() => { setCycleType('daily'); setCycleValue(''); }}>매일</button>
                  <button type="button" className={`cycle-btn ${cycleType === 'weekly' ? 'selected' : ''}`} onClick={() => { setCycleType('weekly'); setCycleValue('월'); }}>매주</button>
                  <button type="button" className={`cycle-btn ${cycleType === 'biweekly' ? 'selected' : ''}`} onClick={() => { setCycleType('biweekly'); setCycleValue('월'); }}>격주</button>
                  <button type="button" className={`cycle-btn ${cycleType === 'monthly' ? 'selected' : ''}`} onClick={() => { setCycleType('monthly'); setCycleValue('1'); }}>매월</button>
                </div>
              </div>

              {(cycleType === 'weekly' || cycleType === 'biweekly') && (
                <div className="form-field fade-in">
                  <label>요일 선택</label>
                  <div className="member-select-container">
                    {WEEK_DAYS.map(day => (
                      <button key={day} type="button" className={`member-btn ${cycleValue === day ? 'selected' : ''}`} onClick={() => setCycleValue(day)}>{day}</button>
                    ))}
                  </div>
                </div>
              )}

              {cycleType === 'monthly' && (
                <div className="form-field fade-in">
                  <label>날짜 선택</label>
                  <select className="date-select" value={cycleValue} onChange={e => setCycleValue(e.target.value)}>
                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}일</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-field">
                <label>담당자 선택 (1명 이상)</label>
                <div className="member-select-container">
                  {MEMBERS.map(m => (
                    <button key={m.name} type="button" className={`member-btn ${selectedAssignees.includes(m.name) ? 'selected' : ''}`} onClick={() => handleAssigneeToggle(m.name)}>
                      {m.avatar} {m.name}
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

      {/* 커스텀 삭제 확인 모달 */}
      {isConfirmOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setIsConfirmOpen(false)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            
            <h3 className="confirm-title" style={{ lineHeight: '1.4' }}>
              <span style={{ color: '#7A9D8C' }}>'{todos.find(t => t.id === todoToDelete)?.title}'</span>을(를)<br/>
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