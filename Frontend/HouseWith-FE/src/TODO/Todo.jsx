import React from 'react';
import './Todo.css';

const Todo = () => {
  return (
    <div className="todo-page">
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