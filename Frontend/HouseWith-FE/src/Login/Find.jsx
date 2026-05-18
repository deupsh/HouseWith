import React, { useState } from 'react';
import { Target, User, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Find = () => {
  // 현재 선택된 탭을 관리하는 상태 ('id' 또는 'password')
  const [activeTab, setActiveTab] = useState('id');

  return (
    <div className="auth-container">
      <div className="top-section">
        <div className="icon-wrapper">
          <Target className="layout-icon" />
        </div>
        <h1 className="layout-title">계정 찾기</h1>
        <p className="layout-description">아이디 또는 비밀번호를 찾을 수 있어요</p>
      </div>

      <div className="auth-form">
        {/* 탭 버튼 영역 */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'id' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('id')}
          >
            아이디 찾기
          </button>
          <button 
            className={`tab ${activeTab === 'password' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 탭 내용 영역 */}
        {activeTab === 'id' ? (
          // [아이디 찾기] 내용
          <div className="tab-content">
            <p className="tab-description">가입 시 등록한 이름과 전화번호를 입력하시면 아이디를 알려드립니다.</p>
            <div className="form-field">
              <label htmlFor="name">이름</label>
              <div className="input-with-icon">
                <User className="input-icon" />
                <input type="text" id="name" placeholder="홍길동" />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="phone">전화번호</label>
              <div className="input-with-icon">
                <Phone className="input-icon" />
                <input type="tel" id="phone" placeholder="010-0000-0000" />
              </div>
            </div>
            <button type="button" className="main-button">아이디 찾기</button>
          </div>
        ) : (
          // [비밀번호 찾기] 내용
          <div className="tab-content">
            <p className="tab-description">가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
            <div className="form-field">
              <label htmlFor="email">이메일</label>
              <div className="input-with-icon">
                <Mail className="input-icon" />
                <input type="email" id="email" placeholder="example@housewith.com" />
              </div>
            </div>
            <button type="button" className="main-button">재설정 메일 보내기</button>
          </div>
        )}
      </div>

      <div className="bottom-links find-links">
        {/* a 태그 대신 Link를 사용하여 새로고침 없이 부드럽게 이동합니다 */}
        <Link to="/login" className="accent-link">← 로그인으로</Link>
        <span className="divider">|</span>
        <Link to="/signup" className="accent-link">회원가입</Link>
      </div>
    </div>
  );
};

export default Find;