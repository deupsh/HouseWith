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
import Toast from './components/Toast';

function App() {
  // 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  // 프로필
  const [currentProfile, setCurrentProfile] = useState(null); 
  // 알림
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => setToastMessage(msg);

  return (
    <BrowserRouter>
    {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className="app-container">
        {isLoggedIn && currentProfile && (
          <Navigation 
            currentProfile={currentProfile} 
            setCurrentProfile={setCurrentProfile} 
            showToast={showToast} 
          />
        )}

        <div className="page-content" style={{ paddingTop: (isLoggedIn && currentProfile) ? '180px' : '40px' }}>
          <Routes>
            {!isLoggedIn ? (
              <>
                <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} showToast={showToast} />} />
                <Route path="/find" element={<Find showToast={showToast} />} />
                <Route path="/signup" element={<SignUp showToast={showToast} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : 

            !currentProfile ? (
              <>
                <Route 
                  path="/select-profile" 
                  element={
                    <Account 
                      onSelect={(profile) => setCurrentProfile(profile)} 
                      showToast={showToast} 
                    />
                  } 
                />
                <Route path="*" element={<Navigate to="/select-profile" />} />
              </>
            ) :

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