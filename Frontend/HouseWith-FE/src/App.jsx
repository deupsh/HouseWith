import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import Toast from './components/Toast';

const Layout = ({ currentProfile, setCurrentProfile, showToast }) => {
  return (
    <>
      <Navigation 
        currentProfile={currentProfile} 
        setCurrentProfile={setCurrentProfile} 
        showToast={showToast} 
      />
      <Outlet />
    </>
  );
};

function App() {
  // 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  // 프로필
  const [currentProfile, setCurrentProfile] = useState(null); 
  // 알림
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => setToastMessage(msg);

  // 앱이 처음 렌더링될 때 딱 한 번 실행되는 자동 로그인 로직
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      // 나중에 백엔드 API가 완성되면, axios.get('/api/auth/verify') 같은 걸 호출하여
      // 만료되지 않은 진짜 토큰인지 검사하는 로직을 여기에 추가 가능
    }
  }, []);

  return (
    <BrowserRouter>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className="app-container">
        <div className="page-content">
          <Routes>
            {/* 로그인 안 된 경우 */}
            {!isLoggedIn ? (
              <>
                <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} showToast={showToast} />} />
                <Route path="/find" element={<Find showToast={showToast} />} />
                <Route path="/signup" element={<SignUp showToast={showToast} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : 

            /* 로그인 되었지만 프로필 선택 안 된 경우 */
            !currentProfile ? (
              <>
                <Route path="/account" element={
                  <Account onSelect={(profile) => setCurrentProfile(profile)} showToast={showToast} />
                } />
                <Route path="*" element={<Navigate to="/account" />} />
              </>
            ) :

            /* 로그인이 되어있고 프로필도 선택된 경우 */
            (
              <>
              {/* 네비게이션 X */}
              <Route path="/account" element={
              <Account 
                onSelect={(profile) => setCurrentProfile(profile)} 
                showToast={showToast} 
              />
            } />

              {/* 네비게이션 O */}
              <Route element={<Layout currentProfile={currentProfile} setCurrentProfile={setCurrentProfile} showToast={showToast} />}>
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/todo" element={<Todo />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/qna" element={<QnA currentProfile={currentProfile} />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="*" element={<Navigate to="/calendar" />} />
            </Route>
            </>
          )}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;