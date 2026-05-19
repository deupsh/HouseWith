import React, { useState } from 'react';
import './Account.css';
import ProfileModal from '../components/ProfileModal';
import { iconList, colorList } from '../constants/profileOptions';

//더미 데이터
const Account = ({ onSelect, showToast, groupName = "홍가네" }) => {
  const [profiles, setProfiles] = useState([
    { profile_id: 1, nickname: '엄마', profile_type: 0, emoji_id: 0, background_id: 0, custom_profile_image: null },
    { profile_id: 2, nickname: '아빠', profile_type: 0, emoji_id: 1, background_id: 1, custom_profile_image: null },
    { profile_id: 3, nickname: '딸', profile_type: 0, emoji_id: 2, background_id: 2, custom_profile_image: null },
    { profile_id: 4, nickname: '아들', profile_type: 0, emoji_id: 3, background_id: 3, custom_profile_image: null },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
const handleModalSubmit = (formData) => {
    const newMember = {
      profile_id: Date.now(),
      ...formData
    };

    setProfiles([...profiles, newMember]);
    setIsModalOpen(false);

    if (showToast) {
      showToast("가족 구성원이 추가되었어요! 🎉"); 
    }
  };

  return (
    <div className="profile-container">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 className="profile-title" style={{ marginBottom: '8px', fontSize: '1.8rem' }}>
          {groupName}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500' }}>
          계정을 선택해주세요
        </p>
      </div>

      <div className="profile-grid">
        {profiles.map((profile) => (
          <button key={profile.profile_id} className="profile-card" onClick={() => onSelect(profile)}>
            <div className="avatar-box" style={{ backgroundColor: profile.profile_type === 0 ? colorList[profile.background_id] : 'transparent' }}>
              {profile.profile_type === 1 ? (
                <img src={profile.custom_profile_image} alt={profile.nickname} className="avatar-img" />
              ) : (
                <span className="avatar-emoji">{iconList[profile.emoji_id]}</span>
              )}
            </div>
            <span className="profile-name">{profile.nickname}</span>
          </button>
        ))}
      </div>

      <button className="add-member-btn" onClick={() => setIsModalOpen(true)}>
        <span className="plus-icon">+</span> 가족 구성원 추가
      </button>

      <ProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode="create" 
        onSubmit={handleModalSubmit} 
      />
    </div>
  );
};

export default Account;