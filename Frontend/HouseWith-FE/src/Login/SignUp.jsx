import React, { useState } from 'react';
import { Smile, User, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Auth.css'; // 만들어둔 통합 CSS 적용!

const SignUp = () => {
  // 입력값 상태 관리
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 회원가입 버튼 클릭 시 실행될 함수
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    // 추후 이 부분에서 Spring Boot 백엔드로 데이터를 전송하게 됩니다.
    alert(`${name}님, 환영합니다! (백엔드 연결 시 실제 가입 처리)`);
  };

  return (
    <div className="auth-container">
      <div className="top-section">
        <div className="icon-wrapper">
          <Smile className="layout-icon" />
        </div>
        <h1 className="layout-title">회원가입</h1>
        <p className="layout-description">HouseWith와 함께 가족 공간을 만들어보세요</p>
      </div>

      <form className="auth-form" onSubmit={handleSignUpSubmit}>
        <div className="form-field">
          <label htmlFor="name">이름</label>
          <div className="input-with-icon">
            <User className="input-icon" />
            <input 
              type="text" 
              id="name" 
              placeholder="홍길동" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="email">이메일</label>
          <div className="input-with-icon">
            <Mail className="input-icon" />
            <input 
              type="email" 
              id="email" 
              placeholder="example@housewith.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="password">비밀번호</label>
          <div className="input-with-icon">
            <Lock className="input-icon" />
            <input 
              type="password" 
              id="password" 
              placeholder="8자 이상 입력해주세요" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <div className="input-with-icon">
            <Lock className="input-icon" />
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder="비밀번호를 다시 입력해주세요" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
        </div>

        <button type="submit" className="main-button">가입하기</button>
      </form>

      <div className="bottom-links">
        <p className="signup-text">
          이미 계정이 있으신가요? <Link to="/login" className="accent-link">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;