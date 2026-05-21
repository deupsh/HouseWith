import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { Calendar, CheckSquare, Image, MessageCircle, BarChart2 } from 'lucide-react';
import ProfileModal from './ProfileModal';
import { iconList, colorList } from '../constants/profileOptions';
import './css/Navigation.css';

const Navigation = ({ currentProfile, setCurrentProfile, showToast }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // 백엔드에 프로필 수정 요청 (PUT 방식)
      await axios.put('/api/members/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentProfile({
        ...currentProfile,
        ...formData
      });
      setIsEditOpen(false);
      if (showToast) showToast("프로필 수정 완료!");

    } catch (error) {
      console.error("프로필 수정 실패:", error);
      
      // 🚨 서버 통신 실패 시 UI 테스트를 위한 Fallback
      setCurrentProfile({
        ...currentProfile,
        ...formData
      });
      setIsEditOpen(false);
      if (showToast) showToast("프로필 수정 완료! (로컬)");
    }
  };

  return (
    <nav className="top-nav">
      <div className="nav-header">
        <h1 className="logo-title">
          <span className="logo-icon">🏠</span> HouseWith
        </h1>
        
        <div 
          className="user-profile-mini" 
          onClick={() => setIsEditOpen(true)}
          style={{ 
            cursor: 'pointer',
            backgroundColor: currentProfile.profile_type === 0 ? colorList[currentProfile.background_id] : 'transparent',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          {currentProfile.profile_type === 1 ? (
            <img 
              src={currentProfile.custom_profile_image} 
              alt="profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <img 
              src={iconList[currentProfile.emoji_id]} 
              alt="avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          )}
        </div>
      </div>

      <div className="nav-tabs">
        <NavLink to="/calendar" className="nav-item">
          <Calendar size={20} />
          <span>캘린더</span>
        </NavLink>
        <NavLink to="/todo" className="nav-item">
          <CheckSquare size={20} />
          <span>할 일</span>
          <span className="notification-dot"></span>
        </NavLink>
        <NavLink to="/gallery" className="nav-item">
          <Image size={20} />
          <span>사진첩</span>
          <span className="notification-dot"></span>
        </NavLink>
        <NavLink to="/qna" className="nav-item">
          <MessageCircle size={20} />
          <span>주간질문</span>
          <span className="notification-dot"></span>
        </NavLink>
        <NavLink to="/analysis" className="nav-item">
          <BarChart2 size={20} />
          <span>주간 분석</span>
        </NavLink>
      </div>

      <ProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        mode="edit" 
        initialData={currentProfile} 
        onSubmit={handleEditSubmit} 
      />
    </nav>
  );
};

export default Navigation;