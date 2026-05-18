import React, { useState } from 'react';
import { Home, Mail, Lock } from 'lucide-react';
import './Auth.css';

// 1. App.jsx에서 넘겨준 onLogin 리모컨을 받아옵니다.
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('example@housewith.com');
  const [password, setPassword] = useState('*********');

  // 2. 로그인 버튼을 누를 때 실행될 함수
  const handleLoginSubmit = (e) => {
    e.preventDefault(); // 새로고침 방지
    // 나중에는 여기서 백엔드(Spring Boot)로 이메일/비밀번호를 보내서 검사해야 합니다.
    // 지금은 무조건 로그인 성공으로 처리합니다!
    onLogin(); 
  };

  return (
    <div className="auth-container">
      <div className="top-section">
        <div className="icon-wrapper">
          <Home className="layout-icon" />
        </div>
        <h1 className="layout-title">HouseWith</h1>
        <p className="layout-description">가족과 함께하는 따뜻한 공간</p>
      </div>
      
      {/* 3. 폼이 제출될 때 handleLoginSubmit 함수가 실행되도록 연결합니다. */}
      <form className="auth-form" onSubmit={handleLoginSubmit}>
        <div className="form-field">
          <label htmlFor="email">이메일</label>
          <div className="input-with-icon">
            <Mail className="input-icon" />
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="password">비밀번호</label>
          <div className="input-with-icon password-input">
            <Lock className="input-icon" />
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="main-button login-button">로그인</button>
      </form>
      
      <div className="bottom-links">
        <a href="/find" className="accent-link">아이디 / 비밀번호 찾기</a>
        <p className="signup-text">
          아직 계정이 없으신가요? <a href="/signup" className="accent-link signup-link">회원가입</a>
        </p>
      </div>
    </div>
  );
};

export default Login;