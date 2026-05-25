import React, { useState } from 'react';
import axios from 'axios';
import { Home, Mail, Lock } from 'lucide-react';
import './Auth.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); 
    setErrorMessage('');

    try {
      const response = await axios.post('/api/auth/login', {
        email: email,
        password: password
      });

      const { accessToken, groupName, slots } = response.data;
      
      // 데이터를 모두 localStorage에 저장
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken.replace('Bearer ', '')); 
      }
      if (groupName) {
        localStorage.setItem('groupName', groupName);
      }
      localStorage.setItem('email', email);
      onLogin(); 

    } catch (error) {
      // 로그인 실패 시 (비밀번호 틀림, 없는 아이디 등)
      console.error("로그인 실패:", error);
      if (error.response && error.response.status === 401) {
        setErrorMessage('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else {
        setErrorMessage('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="auth-wrapper"> 
      <div className="auth-container">
        <div className="top-section">
          <div className="icon-wrapper">
            <Home className="layout-icon" />
          </div>
          <h1 className="layout-title">HouseWith</h1>
          <p className="layout-description">가족과 함께하는 따뜻한 공간</p>
        </div>
        
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <div className="form-field">
            <label htmlFor="email">이메일</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input 
                type="email" 
                id="email" 
                placeholder="이메일을 입력해주세요"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="password">비밀번호</label>
            <div className="input-with-icon password-input">
              <Lock className="input-icon" />
              <input 
                type="password" 
                id="password" 
                placeholder="비밀번호를 입력해주세요"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div style={{ color: '#FF6B6B', fontSize: '0.85rem', textAlign: 'center', marginTop: '-5px', marginBottom: '10px', fontWeight: 'bold' }}>
              {errorMessage}
            </div>
          )}

          <button type="submit" className="main-button login-button">로그인</button>
        </form>
        
        <div className="bottom-links">
          <a href="/find" className="accent-link">아이디 / 비밀번호 찾기</a>
          <p className="signup-text">
            아직 계정이 없으신가요? <a href="/signup" className="accent-link signup-link">회원가입</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;