import React, { useState } from 'react';
import axios from 'axios';
import './Account.css';
import ProfileModal from '../components/ProfileModal';
import { iconList, colorList } from '../constants/profileOptions';

// 더미 데이터
const MOCK_PROFILES = [
  { profile_id: 1, nickname: '엄마', profile_type: 0, emoji_id: 0, background_id: 0, custom_profile_image: null },
  { profile_id: 2, nickname: '아빠', profile_type: 0, emoji_id: 1, background_id: 1, custom_profile_image: null },
  { profile_id: 3, nickname: '딸', profile_type: 0, emoji_id: 2, background_id: 2, custom_profile_image: null },
  { profile_id: 4, nickname: '아들', profile_type: 0, emoji_id: 3, background_id: 3, custom_profile_image: null },
];

const Account = ({ onSelect, showToast, groupName = "홍가네" }) => {
  // 1. 초기 상태를 빈 배열로 세팅
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. 화면이 켜질 때 백엔드에서 프로필 목록 가져오기 (GET)
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('/api/members', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfiles(response.data);
      } catch (error) {
        console.error("프로필 목록 불러오기 실패:", error);
        // 서버 미준비 시 임시 더미 데이터로 화면 유지
        setProfiles(MOCK_PROFILES);
      }
    };

    fetchProfiles();
  }, []);
  
  // 3. 새 가족 구성원 백엔드에 저장하기 (POST)
  const handleModalSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('/api/members', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 백엔드에서 저장 후 돌려준 진짜 데이터(DB에서 생성된 ID 포함)로 화면 갱신
      setProfiles([...profiles, response.data]);
      setIsModalOpen(false);

      if (showToast) {
        showToast("가족 구성원이 추가되었습니다!"); 
      }
    } catch (error) {
      console.error("가족 구성원 추가 실패:", error);
      
      // Fallback: 로컬 임시 저장
      const newMember = {
        profile_id: Date.now(),
        ...formData
      };
      setProfiles([...profiles, newMember]);
      setIsModalOpen(false);

      if (showToast) {
        showToast("가족 구성원이 추가되었습니다! (로컬)"); 
      }
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
                <img 
                  src={iconList[profile.emoji_id]} 
                  alt={`avatar-${profile.emoji_id}`} 
                  className="avatar-img" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                />
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