import React, { useState } from 'react';
import axios from 'axios';
import { Target, User, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Find = () => {
  const [activeTab, setActiveTab] = useState('id');

  //  1. 사용자가 입력할 폼 데이터 상태
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  //  2. 화면에 띄워줄 결과 메시지 상태 (성공/에러)
  const [message, setMessage] = useState({ type: '', text: '' });

  // 탭 변경 시 입력값과 메시지 초기화
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' });
    setName('');
    setPhone('');
    setEmail('');
  };

  //  3. 아이디 찾기 API 호출
  const handleFindIdSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      setMessage({ type: 'error', text: '이름과 전화번호를 모두 입력해주세요.' });
      return;
    }

    try {
      const response = await axios.post('/api/auth/find-id', { name, phone });
      setMessage({ type: 'success', text: `회원님의 아이디는 [ ${response.data.email} ] 입니다.` });
    } catch (error) {
      console.error("아이디 찾기 실패:", error);
      setMessage({ type: 'error', text: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다. (서버 미연결)' });
    }
  };

  //  4. 비밀번호 찾기(재설정 메일 발송) API 호출
  const handleFindPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: '가입하신 이메일을 입력해주세요.' });
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', { email });
      setMessage({ type: 'success', text: '입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.' });
    } catch (error) {
      console.error("비밀번호 찾기 실패:", error);
      setMessage({ type: 'error', text: '가입되지 않은 이메일이거나 서버와 연결할 수 없습니다.' });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        <div className="top-section">
          <div className="icon-wrapper">
            <Target className="layout-icon" />
          </div>
          <h1 className="layout-title">계정 찾기</h1>
          <p className="layout-description">아이디 또는 비밀번호를 찾을 수 있어요</p>
        </div>

        <div className="auth-form">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'id' ? 'active-tab' : ''}`}
              onClick={() => handleTabChange('id')}
            >
              아이디 찾기
            </button>
            <button 
              className={`tab ${activeTab === 'password' ? 'active-tab' : ''}`}
              onClick={() => handleTabChange('password')}
            >
              비밀번호 찾기
            </button>
          </div>

          {activeTab === 'id' ? (
            // [아이디 찾기] 내용
            <form className="tab-content" onSubmit={handleFindIdSubmit}>
              <p className="tab-description">가입 시 등록한 이름과 전화번호를 입력하시면 아이디를 알려드립니다.</p>
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
                <label htmlFor="phone">전화번호</label>
                <div className="input-with-icon">
                  <Phone className="input-icon" />
                  <input 
                    type="tel" 
                    id="phone" 
                    placeholder="010-0000-0000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              
              {message.text && (
                <div style={{ color: message.type === 'success' ? '#7A9D8C' : '#FF6B6B', fontSize: '0.9rem', textAlign: 'center', marginTop: '-5px', marginBottom: '15px', fontWeight: 'bold' }}>
                  {message.text}
                </div>
              )}

              <button type="submit" className="main-button">아이디 찾기</button>
            </form>
          ) : (
            // [비밀번호 찾기] 내용
            <form className="tab-content" onSubmit={handleFindPasswordSubmit}>
              <p className="tab-description">가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
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

              {message.text && (
                <div style={{ color: message.type === 'success' ? '#7A9D8C' : '#FF6B6B', fontSize: '0.9rem', textAlign: 'center', marginTop: '-5px', marginBottom: '15px', fontWeight: 'bold' }}>
                  {message.text}
                </div>
              )}

              <button type="submit" className="main-button">메일 보내기</button>
            </form>
          )}
        </div>

        <div className="bottom-links find-links">
          <Link to="/login" className="accent-link">← 로그인으로</Link>
          <span className="divider">|</span>
          <Link to="/signup" className="accent-link">회원가입</Link>
        </div>

      </div>
    </div>
  );
};

export default Find;