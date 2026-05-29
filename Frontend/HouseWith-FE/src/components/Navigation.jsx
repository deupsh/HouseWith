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
      
      // 1. FormData 객체 생성 (파일 업로드 필수)
      const submitData = new FormData();
      submitData.append('nickname', formData.nickname);
      submitData.append('profileEmoji', formData.emoji_id);
      submitData.append('profileBackground', formData.background_id);
      submitData.append('profileType', formData.profile_type);
      
      // 프로필 이미지가 선택되었을 때만 추가
      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage);
      }

      // 2. 정확한 API 주소로 PUT 요청 (slotId 포함)
      await axios.put(`/api/slots/${currentProfile.profile_id}`, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // 멀티파트 명시
        }
      });

      setIsEditOpen(false);
      if (showToast) showToast("프로필 수정 완료!");
      
      // 저장 성공 후 화면을 새로고침하여 바뀐 프로필 사진을 DB에서 다시 받아옵니다.
      window.location.reload();

    } catch (error) {
      console.error("프로필 수정 실패:", error);
      if (showToast) showToast("프로필 수정에 실패했습니다.");
    }
  };

  return (
    <nav className="top-nav">
      <div className="nav-header">
        <NavLink to="/Account" className="logo-link">
          <h1 className="logo-title">
            <span className="logo-icon">🏠</span> HouseWith
          </h1>
        </NavLink>
        
        <div 
          className="user-profile-wrapper" 
          onClick={() => setIsEditOpen(true)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <span className="user-name" style={{ fontWeight: '600', color: '#333' }}>
            {currentProfile.nickname} 님
          </span>
          <div 
            className="user-profile-mini" 
            style={{ 
              backgroundColor: currentProfile.profile_type === 0 ? colorList[currentProfile.background_id] : 'transparent',
              overflow: 'hidden',
              borderRadius: '12px' // 둥근 모서리 추가
            }}
          >
            {currentProfile.profile_type === 1 ? (
              <img 
                src={`http://${window.location.hostname}/uploads${currentProfile.custom_profile_image}`} 
                alt="profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <img src={iconList[currentProfile.emoji_id]} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
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
        </NavLink>
        <NavLink to="/gallery" className="nav-item">
          <Image size={20} />
          <span>사진첩</span>
        </NavLink>
        <NavLink to="/qna" className="nav-item">
          <MessageCircle size={20} />
          <span>주간질문</span>
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