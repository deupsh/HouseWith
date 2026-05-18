import React from 'react';
import './Todo.css';

const Todo = () => {
  return (
    <div className="todo-page">
      {/* 가족 상태 및 넛지 말풍선 */}
      <div className="family-status-card">
        <div className="member-status">
          <div className="avatar">👦</div>
          <div className="info">
            <strong>아들</strong>
            <span>오전 8:15</span>
          </div>
          <div className="mood">😴 피곤해요</div>
        </div>
        
        {/* 미접속 넛지 말풍선 */}
        <div className="nudge-bubble">
          <p>지난 5일 동안 접속하지 않았어요. 아들에게 연락해보는 건 어떨까요?</p>
        </div>
      </div>

      <button className="add-todo-btn">+ 새로운 집안일 추가</button>

      <div className="todo-list-section">
        <h3>진행 중 (4)</h3>
        {/* 반복해서 리스트 아이템 생성 */}
        <div className="todo-item">
          <input type="radio" className="todo-check" />
          <div className="todo-info">
            <span className="title">설거지</span>
            <span className="cycle">🔄 매일</span>
          </div>
          <div className="todo-assignee">
            <span className="avatar-mini">👩</span> 엄마
          </div>
          <div className="todo-actions">
            <button>✏️</button>
            <button>🗑️</button>
          </div>
        </div>
        {/* 추가 리스트 아이템 생략... */}
      </div>

      <div className="todo-list-section">
        <h3>완료됨 (1)</h3>
        <div className="todo-item completed">
          <span className="check-icon">✔️</span>
          <div className="todo-info">
            <span className="title">청소기 돌리기</span>
            <span className="cycle">🔄 매주</span>
          </div>
          <div className="todo-assignee">
            <span className="avatar-mini">👨</span> 아빠
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo;