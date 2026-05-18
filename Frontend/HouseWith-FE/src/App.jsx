import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './Login/Login';
import Find from './Login/Find';
import SignUp from './Login/SignUp';
import Account from './Login/Account'
import Calendar from './Calendar/Calendar';
import Todo from './TODO/Todo';
import Gallery from './Gallery/Gallery';
import QnA from './QnA/QnA';
import Analysis from './Analysis/Analysis';
import './App.css';

function App() {
  // 1단계: 계정 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  // 2단계: 누구의 프로필로 들어왔는지 상태 (null이면 아직 선택 안 함)
  const [currentProfile, setCurrentProfile] = useState(null); 

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* 네비게이션 바는 '로그인'하고 '프로필까지 선택'해야만 보입니다 */}
        {isLoggedIn && currentProfile && <Navigation />}
        
        {/* 네비게이션 바 유무에 따라 상단 여백 조절 */}
        <div className="page-content" style={{ paddingTop: (isLoggedIn && currentProfile) ? '180px' : '40px' }}>
          <Routes>
            {/* 1. 로그인이 안 된 상태 */}
            {!isLoggedIn ? (
              <>
                <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
                <Route path="/find" element={<Find />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : 
            
            /* 2. 로그인은 했지만 아직 프로필 선택을 안 한 상태 */
            !currentProfile ? (
              <>
                <Route 
                  path="/select-profile" 
                  element={<Account onSelect={(profile) => setCurrentProfile(profile)} />} 
                />
                <Route path="*" element={<Navigate to="/select-profile" />} />
              </>
            ) : 
            
            /* 3. 로그인 완료 & 프로필 선택 완료 상태 (메인 앱) */
            (
              <>
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/todo" element={<Todo />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/qna" element={<QnA />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="*" element={<Navigate to="/calendar" />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;