import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, X, Settings } from 'lucide-react';
import './Account.css';
import ProfileModal from '../components/ProfileModal';
import { iconList, colorList } from '../constants/profileOptions';
import ErrorMessage from '../components/ErrorMessage';

// 더미 데이터
const MOCK_PROFILES = [
  { profile_id: 1, nickname: '엄마', profile_type: 0, emoji_id: 0, background_id: 0, custom_profile_image: null, has_pin: false },
  { profile_id: 2, nickname: '아빠', profile_type: 0, emoji_id: 1, background_id: 1, custom_profile_image: null, has_pin: true }, 
  { profile_id: 3, nickname: '딸', profile_type: 0, emoji_id: 2, background_id: 2, custom_profile_image: null, has_pin: false },
  { profile_id: 4, nickname: '아들', profile_type: 0, emoji_id: 3, background_id: 3, custom_profile_image: null, has_pin: true },
];

const Account = ({ onSelect, showToast, groupName = "홍가네" }) => {
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 계정 관리(삭제) 모드 상태
  const [isManageMode, setIsManageMode] = useState(false);

  // PIN 모달 관련 상태
  const [pinModalProfile, setPinModalProfile] = useState(null); 
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // 화면이 켜질 때 백엔드에서 프로필 목록 가져오기
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
        setProfiles(MOCK_PROFILES);
      }
    };

    fetchProfiles();
  }, []);
  
  // 프로필 클릭 시 (관리 모드일 때는 무시)
  const handleProfileClick = (profile) => {
    if (isManageMode) return;

    if (profile.has_pin) {
      setPinModalProfile(profile);
      setPinInput('');
      setPinError('');
    } else {
      onSelect(profile);
    }
  };

  // 계정 삭제 함수 (DELETE)
  const handleDeleteProfile = async (e, profileId, nickname) => {
    e.stopPropagation(); // 부모(button) 클릭 이벤트 방지
    
    if (window.confirm(`'${nickname}' 계정을 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`)) {
      try {
        const token = localStorage.getItem('accessToken');
        // 백엔드 삭제 API 통신
        await axios.delete(`/api/members/${profileId}`, { headers: { Authorization: `Bearer ${token}` }});
        
        // 화면에서 즉시 제거
        setProfiles(profiles.filter(p => p.profile_id !== profileId));
        if (showToast) showToast("계정이 삭제되었습니다.");
        
      } catch (error) {
        console.error("계정 삭제 실패:", error);
        // 서버 미연결 시 로컬 테스트용
        setProfiles(profiles.filter(p => p.profile_id !== profileId));
        if (showToast) showToast("계정이 삭제되었습니다. (로컬)");
      }
    }
  };

  // PIN 번호 제출(검증) 함수
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pinInput.length !== 6) {
      setPinError('PIN 번호 6자리를 모두 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`/api/members/${pinModalProfile.profile_id}/verify-pin`, { pin_code: pinInput }, {
         headers: { Authorization: `Bearer ${token}` }
       });

      setPinModalProfile(null);
      onSelect(pinModalProfile);
    } catch (error) {
      console.error("PIN 검증 실패:", error);
      setPinError('PIN 번호가 일치하지 않습니다.');
      
      // UI 테스트용 강제 성공 처리
      if (pinInput === '123456') { 
        setPinModalProfile(null);
        onSelect(pinModalProfile);
      }
    }
  };

  // 새 가족 구성원 저장 (POST)
  const handleModalSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('/api/members', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfiles([...profiles, response.data]);
      setIsModalOpen(false);
      if (showToast) showToast("가족 구성원이 추가되었습니다!"); 
    } catch (error) {
      const newMember = {
        profile_id: Date.now(),
        ...formData,
        has_pin: formData.pin_code ? true : false
      };
      setProfiles([...profiles, newMember]);
      setIsModalOpen(false);
      if (showToast) showToast("가족 구성원이 추가되었습니다! (로컬)"); 
    }
  };

  return (
    <div className="profile-container">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 className="profile-title" style={{ marginBottom: '8px', fontSize: '1.8rem' }}>
          {groupName}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500' }}>
          {isManageMode ? '삭제할 계정을 선택해주세요' : '계정을 선택해주세요'}
        </p>
      </div>

      <div className="profile-grid">
        {profiles.map((profile) => (
          <button 
            key={profile.profile_id} 
            className={`profile-card ${isManageMode ? 'manage-mode-active' : ''}`} 
            onClick={() => handleProfileClick(profile)}
            style={{ position: 'relative', opacity: isManageMode ? 0.8 : 1, transition: 'all 0.2s' }}
          >
            <div className="avatar-box" style={{ backgroundColor: profile.profile_type === 0 ? colorList[profile.background_id] : 'transparent', position: 'relative' }}>
              
              {/* 🌟 관리 모드일 때 엑스박스(삭제) 배지 렌더링 */}
              {isManageMode && (
                <div 
                  onClick={(e) => handleDeleteProfile(e, profile.profile_id, profile.nickname)}
                  style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#FF6B6B', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                  <X size={16} color="white" />
                </div>
              )}

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
              {profile.has_pin && !isManageMode && <Lock size={14} color="#888" />}
            </span>
          </button>
        ))}
      </div>

      {/* 계정 추가 & 관리 버튼 그룹 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!isManageMode && (
          <button className="add-member-btn" onClick={() => setIsModalOpen(true)}>
            <span className="plus-icon">+</span> 가족 구성원 추가
          </button>
        )}

        <button 
          onClick={() => setIsManageMode(!isManageMode)}
          style={{ background: 'transparent', border: 'none', color: isManageMode ? '#FF6B6B' : '#888', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', padding: '10px' }}
        >
          {isManageMode ? (
             <>완료</>
          ) : (
            <><Settings size={16} /> 계정 관리</>
          )}
        </button>
      </div>

      <ProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode="create" 
        onSubmit={handleModalSubmit} 
      />
    
      {/* PIN 번호 입력 모달 */}
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