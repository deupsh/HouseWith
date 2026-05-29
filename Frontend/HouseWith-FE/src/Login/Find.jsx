import React, { useState } from 'react';
import axios from 'axios';
import { Target, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Find = () => {
  const [activeTab, setActiveTab] = useState('id');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [foundEmails, setFoundEmails] = useState([]); 
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' });
    setFoundEmails([]);
    setPhone('');
    setEmail('');
  };

  // 3. 아이디 찾기 API 호출 (POST 보정)
  const handleFindIdSubmit = async (e) => {
    e.preventDefault();
    if (!phone) {
      setMessage({ type: 'error', text: '전화번호를 입력해주세요.' });
      return;
    }

    try {
      setMessage({ type: '', text: '' });
      setFoundEmails([]);

      const response = await axios.post('/api/auth/find-email', { 
        phoneNumber: phone 
      });
      
      setFoundEmails(response.data);
      setMessage({ type: 'success', text: '회원님의 정보와 일치하는 계정을 찾았습니다.' });
    } catch (error) {
      console.error("아이디 찾기 실패:", error);
      
      // 스프링 에러 객체가 들어올 경우 내부 message 텍스트만 추출하여 크래시 방지
      const serverMessage = error.response?.data?.message || error.response?.data;
      const errorText = typeof serverMessage === 'string' ? serverMessage : '계정을 찾을 수 없거나 서버 오류가 발생했습니다.';
      
      setMessage({ type: 'error', text: errorText });
    }
  };

  // 4. 비밀번호 확인 API 호출 (POST 보정)
  const handleFindPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: '가입하신 이메일을 입력해주세요.' });
      return;
    }

    try {
      setMessage({ type: '', text: '' });

      const response = await axios.post('/api/auth/find-password', { 
        email: email 
      });
      
      setMessage({ 
        type: 'success', 
        text: `임시 비밀번호가 발급되었습니다: [ ${response.data} ]` 
      });
    } catch (error) {
      console.error("비밀번호 찾기 실패:", error);
      
      // 스프링 에러 객체가 들어올 경우 내부 message 텍스트만 추출하여 크래시 방지
      const serverMessage = error.response?.data?.message || error.response?.data;
      const errorText = typeof serverMessage === 'string' ? serverMessage : '존재하지 않는 이메일이거나 서버 오류가 발생했습니다.';
      
      setMessage({ type: 'error', text: errorText });
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
            <form className="tab-content" onSubmit={handleFindIdSubmit}>
              <p className="tab-description">가입 시 등록한 전화번호를 입력하시면 마스킹된 아이디 목록을 알려드립니다.</p>
              
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
                <div style={{ color: message.type === 'success' ? '#7A9D8C' : '#FF6B6B', fontSize: '0.9rem', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                  {message.text}
                </div>
              )}

              {foundEmails.length > 0 && (
                <div style={{ backgroundColor: '#F4F7F5', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0, textAlign: 'center' }}>
                    {foundEmails.map((emailStr, idx) => (
                      <li key={idx} style={{ color: '#333', fontSize: '0.95rem', fontWeight: '600', padding: '4px 0' }}>
                        {emailStr}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button type="submit" className="main-button">아이디 찾기</button>
            </form>
          ) : (
            <form className="tab-content" onSubmit={handleFindPasswordSubmit}>
              <p className="tab-description">가입 시 사용한 이메일 주소를 입력하시면 임시 비밀번호를 화면에 즉시 발급해 드립니다.</p>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                  <div style={{ color: message.type === 'success' ? '#7A9D8C' : '#FF6B6B', fontSize: '0.95rem', textAlign: 'center', fontWeight: 'bold' }}>
                    {message.text}
                  </div>
                  {message.type === 'success' && (
                    <small style={{ color: '#888', fontSize: '0.75rem', textAlign: 'center' }}>
                      * 안전을 위해 로그인 후 마이페이지에서 비밀번호를 꼭 변경해 주세요.
                    </small>
                  )}
                </div>
              )}

              <button type="submit" className="main-button">임시 비밀번호 발급</button>
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