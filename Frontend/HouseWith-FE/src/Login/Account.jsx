import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, X } from 'lucide-react';
import './Account.css';
import ProfileModal from '../components/ProfileModal';
import { iconList, colorList } from '../constants/profileOptions';
import ErrorMessage from '../components/ErrorMessage';

// 더미 데이터
const MOCK_PROFILES = [
  { profile_id: 1, nickname: '엄마', profile_type: 0, emoji_id: 0, background_id: 0, custom_profile_image: null, has_pin: false },
  { profile_id: 2, nickname: '아빠', profile_type: 0, emoji_id: 1, background_id: 1, custom_profile_image: null, has_pin: true }, // 🔒 아빠 계정 잠금
  { profile_id: 3, nickname: '딸', profile_type: 0, emoji_id: 2, background_id: 2, custom_profile_image: null, has_pin: false },
  { profile_id: 4, nickname: '아들', profile_type: 0, emoji_id: 3, background_id: 3, custom_profile_image: null, has_pin: true }, // 🔒 아들 계정 잠금
];

const Account = ({ onSelect, showToast, groupName = "홍가네" }) => {
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // PIN 모달 관련 상태
  const [pinModalProfile, setPinModalProfile] = useState(null); // 어떤 프로필의 PIN을 입력 중인지
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // 화면이 켜질 때 백엔드에서 프로필 목록 가져오기 (GET)
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
  
  // 프로필 클릭 시
  const handleProfileClick = (profile) => {
    if (profile.has_pin) {
      // PIN이 있으면 모달을 띄우고 상태 초기화
      setPinModalProfile(profile);
      setPinInput('');
      setPinError('');
    } else {
      // PIN이 없으면 곧바로 로그인(선택) 처리
      onSelect(profile);
    }
  };

  //PIN 번호 제출(검증) 함수
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pinInput.length !== 6) {
      setPinError('PIN 번호 6자리를 모두 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // 백엔드로 PIN 번호 검증 요청 (POST)
      await axios.post(`/api/members/${pinModalProfile.profile_id}/verify-pin`, { pin_code: pinInput }, {
         headers: { Authorization: `Bearer ${token}` }
       });

      // 검증 성공 시 모달 닫고 로그인(선택) 처리
      setPinModalProfile(null);
      onSelect(pinModalProfile);

    } catch (error) {
      console.error("PIN 검증 실패:", error);
      // 서버 에러
      setPinError('PIN 번호가 일치하지 않습니다.');
      
      // 🚨 UI 테스트용 강제 성공 처리
      if (pinInput === '123456') { 
        setPinModalProfile(null);
        onSelect(pinModalProfile);
      }
    }
  };

  // 새 가족 구성원 백엔드에 저장하기 (POST)
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
          <button key={profile.profile_id} className="profile-card" onClick={() => handleProfileClick(profile)}>
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
            <span className="profile-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              {profile.nickname}
              {profile.has_pin && <Lock size={14} color="#888" />}
            </span>
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
    
      {pinModalProfile && (
        <div className="modal-overlay" onClick={() => setPinModalProfile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '320px', textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
              <h3 style={{ margin: 0 }}>PIN 번호 입력</h3>
              <button className="close-btn" onClick={() => setPinModalProfile(null)} style={{ position: 'absolute', right: '0' }}><X size={20}/></button>
            </div>
            
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
              <strong>{pinModalProfile.nickname}</strong>님의 계정입니다.<br/>6자리 PIN 번호를 입력해주세요.
            </p>

            <form onSubmit={handlePinSubmit}>
              <div className="pin-input-wrapper" style={{ justifyContent: 'center', marginBottom: '10px' }}>
                <Lock size={18} className="pin-icon" style={{ left: '15px' }} />
                <input 
                  type="password" 
                  placeholder="숫자 6자리" 
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                    if (pinError) setPinError('');
                  }}
                  maxLength={6}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ddd' }}
                  autoFocus
                />
              </div>
              <ErrorMessage message={pinError} style={{ display: 'block', marginBottom: '20px' }} />
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                접속하기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;