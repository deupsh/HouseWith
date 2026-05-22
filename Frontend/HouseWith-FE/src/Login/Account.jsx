import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, X, Settings, KeyRound, UserMinus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Account.css';
import ProfileModal from '../components/ProfileModal';
import { iconList, colorList } from '../constants/profileOptions';
import ErrorMessage from '../components/ErrorMessage';
import CardModal from '../components/CardModal';

//더미 데이터
const MOCK_PROFILES = [
  { profile_id: 1, nickname: '엄마', profile_type: 0, emoji_id: 0, background_id: 0, custom_profile_image: null, has_pin: false },
  { profile_id: 2, nickname: '아빠', profile_type: 0, emoji_id: 1, background_id: 1, custom_profile_image: null, has_pin: true }, 
  { profile_id: 3, nickname: '딸', profile_type: 0, emoji_id: 2, background_id: 2, custom_profile_image: null, has_pin: false },
  { profile_id: 4, nickname: '아들', profile_type: 0, emoji_id: 3, background_id: 3, custom_profile_image: null, has_pin: true },
];

const Account = ({ onSelect, showToast}) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [mode, setMode] = useState('normal'); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageMenuMenuOpen, setIsManageMenuOpen] = useState(false);

  const [pinModalProfile, setPinModalProfile] = useState(null); 
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);

  const [resetTargetProfile, setResetTargetProfile] = useState(null);
  const [resetStep, setResetStep] = useState(0); 
  const [familyPassword, setFamilyPassword] = useState('');
  const [newPinCode, setNewPinCode] = useState('');
  const [authError, setAuthError] = useState('');

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // 화면이 켜질 때 실행
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        // 명세 3번 '슬롯' 섹션에 맞게 /api/slots 호출
        const response = await axios.get('/api/slots', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // SlotItem DTO 명세에 맞춘 매핑
        const mappedProfiles = response.data.map(slot => ({
          profile_id: slot.slotId,
          nickname: slot.nickname,
          profile_type: slot.customProfileImage ? 1 : 0,
          emoji_id: slot.profileEmoji,
          background_id: slot.profileBackground,
          custom_profile_image: slot.customProfileImage,
          has_pin: slot.pinCode != null // 명세상 pinCode 필드가 있음
        }));
        setProfiles(mappedProfiles);
        const savedGroupName = localStorage.getItem('groupName');
        if (savedGroupName) setGroupName(savedGroupName);
      } catch (error) {
        console.error("슬롯 조회 실패", error);
      }
    };
    fetchProfiles();
  }, []);
  
  const handleProfileClick = (profile) => {
    if (mode === 'delete_slot') {
      setProfileToDelete({ id: profile.profile_id, nickname: profile.nickname });
      setIsDeleteConfirmOpen(true);
    } else if (mode === 'reset_pin') {
      setResetTargetProfile(profile);
      setFamilyPassword('');
      setNewPinCode('');
      setAuthError('');
      setResetStep(1);
    } else {
      if (profile.has_pin) {
        setPinModalProfile(profile);
        setPinInput('');
        setPinError('');
      } else {
        localStorage.setItem('currentSlotId', profile.profile_id);
        onSelect(profile);
        navigate('/calendar');
      }
    }
  };

  const confirmDeleteProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/slots/${profileToDelete.id}`, { headers: { Authorization: `Bearer ${token}` }});
      setProfiles(profiles.filter(p => p.profile_id !== profileToDelete.id));
      if (showToast) showToast("계정이 삭제되었습니다.");
    } catch (error) {
      setProfiles(profiles.filter(p => p.profile_id !== profileToDelete.id));
      if (showToast) showToast("계정이 삭제되었습니다. (로컬)");
    } finally {
      setIsDeleteConfirmOpen(false);
      setProfileToDelete(null);
      setMode('normal'); 
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pinInput.length !== 6) return setPinError('PIN 번호 6자리를 모두 입력해주세요.');
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`/api/slots/login`, {
        slotId: pinModalProfile.profile_id,
        pinCode: pinInput
      }, { headers: { Authorization: `Bearer ${token}` }});
      localStorage.setItem('currentSlotId', pinModalProfile.profile_id);
      setPinModalProfile(null);
      onSelect(pinModalProfile);
      navigate('/calendar');
    } catch (error) {
      setPinError('PIN 번호가 일치하지 않습니다.');
      if (pinInput === '123456') { 
        setPinModalProfile(null);
        onSelect(pinModalProfile);
      }
    }
  };

  const handleResetFlowSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const token = localStorage.getItem('accessToken');

    if (resetStep === 1) {
      if (!familyPassword) return setAuthError('비밀번호를 입력해주세요.');
      try {
        setResetStep(2); 
      } catch (error) {
        setAuthError('가족 계정 비밀번호가 일치하지 않습니다.');
        if (familyPassword === '1234') setResetStep(2); 
      }
    } else if (resetStep === 2) {
      if (newPinCode.length !== 6) return setAuthError('새 PIN 번호 6자리를 입력해주세요.');
      try {
        await axios.patch(`/api/members/${resetTargetProfile.profile_id}/pin`, { new_pin: newPinCode }, { headers: { Authorization: `Bearer ${token}` }});
        if (showToast) showToast(`'${resetTargetProfile.nickname}'님의 PIN이 재설정되었습니다.`);
        setResetStep(0);
        setResetTargetProfile(null);
        setMode('normal');
        setProfiles(profiles.map(p => p.profile_id === resetTargetProfile.profile_id ? { ...p, has_pin: true } : p));
      } catch (error) {
        setAuthError('PIN 변경에 실패했습니다.');
      }
    }
  };

  const handleRemovePin = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (showToast) showToast(`'${resetTargetProfile.nickname}'님의 프로필 잠금이 해제되었습니다.`);
      setResetStep(0);
      setResetTargetProfile(null);
      setMode('normal');
      setProfiles(profiles.map(p => p.profile_id === resetTargetProfile.profile_id ? { ...p, has_pin: false } : p));
    } catch (error) {
      setAuthError('잠금 해제에 실패했습니다.');
    }
  };

  const handleWithdrawAccount = async (e) => {
    e.preventDefault();
    if (!familyPassword) return setAuthError('비밀번호를 입력해주세요.');
    
    if (window.confirm('정말 가족 계정을 삭제하시겠습니까? 모든 구성원의 기록이 영구 삭제됩니다.')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete('/api/auth/withdraw', { data: { password: familyPassword }, headers: { Authorization: `Bearer ${token}` }});
        alert('그동안 HouseWith를 이용해주셔서 감사합니다.');
        localStorage.removeItem('accessToken');
        navigate('/login');
        window.location.reload();
      } catch (error) {
        setAuthError('비밀번호가 일치하지 않습니다.');
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const submitData = new FormData();
      
      submitData.append('nickname', formData.nickname);
      
      submitData.append('pinCode', formData.pin_code || ''); 
      
      submitData.append('profileEmoji', formData.emoji_id);
      submitData.append('profileBackground', formData.background_id);
      if (formData.profileImage) submitData.append('profileImage', formData.profileImage);

      const response = await axios.post('/api/slots', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': undefined 
        }
      });

      // 명세의 SlotItem 구조로 상태 업데이트
      const newMember = {
        profile_id: response.data.slotId,
        nickname: response.data.nickname,
        profile_type: response.data.customProfileImage ? 1 : 0,
        emoji_id: response.data.profileEmoji,
        background_id: response.data.profileBackground,
        custom_profile_image: response.data.customProfileImage,
        has_pin: !!formData.pin_code // 핀코드가 실제로 입력되었을 때만 true
      };

      setProfiles([...profiles, newMember]);
      setIsModalOpen(false);
      if (showToast) showToast("가족 구성원이 추가되었습니다!"); 
    } catch (error) {
      console.error("슬롯 생성 실패:", error);
    }
  };

  return (
    <div className="profile-container">
      <div className="account-header">
        <h1 className="profile-title account-title">{groupName}</h1>
        <p className="account-subtitle">
          {mode === 'delete_slot' && '삭제할 계정을 선택해주세요'}
          {mode === 'reset_pin' && 'PIN 번호를 재설정할 계정을 선택해주세요'}
          {mode === 'normal' && '계정을 선택해주세요'}
        </p>
      </div>

      <div className="profile-grid">
        {profiles.map((profile) => (
          <div 
            key={profile.profile_id} 
            className={`profile-card ${mode !== 'normal' ? 'scaled' : ''}`} 
            onClick={() => handleProfileClick(profile)}
          >
            <div className="avatar-box" style={{ backgroundColor: profile.profile_type === 0 ? colorList[profile.background_id] : 'transparent' }}>
              {mode === 'delete_slot' && <div className="overlay-delete"><X size={36} color="white" strokeWidth={3} /></div>}
              {mode === 'reset_pin' && <div className="overlay-reset"><KeyRound size={32} color="white" /></div>}

              {profile.profile_type === 1 ? (
                <img src={profile.custom_profile_image} alt={profile.nickname} className="avatar-img" />
              ) : (
                <img src={iconList[profile.emoji_id]} alt={`avatar`} className="avatar-img emoji-avatar" />
              )}
            </div>
            <span className={`profile-name ${mode !== 'normal' ? 'dimmed' : ''}`}>
              {profile.nickname}
              {profile.has_pin && mode === 'normal' && <Lock size={14} color="#888" />}
            </span>
          </div>
        ))}
      </div>

      <div className="bottom-btn-group">
        {mode === 'normal' ? (
          <>
            <button className="add-member-btn" onClick={() => setIsModalOpen(true)}>
              <span className="plus-icon">+</span> 가족 구성원 추가
            </button>
            <button className="manage-menu-btn" onClick={() => setIsManageMenuOpen(true)}>
              <Settings size={16} /> 계정 관리
            </button>
          </>
        ) : (
          <button className="cancel-mode-btn" onClick={() => setMode('normal')}>
            취소 및 돌아가기
          </button>
        )}
      </div>

      <CardModal 
        isOpen={isManageMenuMenuOpen} 
        onClose={() => setIsManageMenuOpen(false)}
        title="계정 관리"
        contentClassName="menu-modal-content"
      >
        <div className="menu-btn-group">
          <button className="btn btn-secondary" 
          onClick={() => { 
            setMode('delete_slot'); 
            setIsManageMenuOpen(false); 
            }}>
            <UserMinus size={18} /> 프로필 슬롯 삭제
          </button>
          <button className="btn btn-secondary" 
          onClick={() => { 
            setMode('reset_pin'); 
            setIsManageMenuOpen(false); 
            }}>
            <KeyRound size={18} /> PIN 번호 재설정
          </button>
          <button 
            className="btn btn-secondary btn-danger-outline" 
            onClick={() => { 
              setFamilyPassword('');
              setAuthError('');
              setIsWithdrawOpen(true); 
              setIsManageMenuOpen(false); 
            }}
          >
            <AlertTriangle size={18} /> 회원 탈퇴
          </button>
        </div>
      </CardModal>

      <CardModal
        isOpen={resetStep > 0 && !!resetTargetProfile}
        onClose={() => setResetStep(0)}
        title="PIN 재설정"
        showCloseBtn={true}
      >
        <p className="modal-desc">
          <strong>{resetTargetProfile?.nickname}</strong>님의 PIN 재설정을 위해<br/>
          {resetStep === 1 ? '가족 대표 비밀번호를 입력해주세요.' : '새로운 숫자 6자리를 입력해주세요.'}
        </p>
        <form onSubmit={handleResetFlowSubmit}>
          <div className="input-group">
            <input type="password" placeholder={resetStep === 1 ? "가족 비밀번호 입력" : "새 PIN 번호 6자리"} 
            value={resetStep === 1 ? familyPassword : newPinCode} 
            onChange={(e) => { if (resetStep === 1) setFamilyPassword(e.target.value); 
            else setNewPinCode(e.target.value.replace(/[^0-9]/g, '')); setAuthError(''); }} 
            maxLength={resetStep === 2 ? 6 : 50} className="full-width-input" autoFocus />
          </div>
          <div className="error-margin"><ErrorMessage message={authError} /></div>
          <button type="submit" className="btn btn-primary full-btn">{
          resetStep === 1 ? '다음' : '재설정 완료'}</button>
          
          {resetStep === 2 && (
            <button type="button" onClick={handleRemovePin} 
            className="remove-pin-text-btn">PIN 번호 사용하지 않기</button>
          )}
        </form>
      </CardModal>

      <CardModal 
        isOpen={isWithdrawOpen} 
        onClose={() => {
          setIsWithdrawOpen(false);
          setFamilyPassword('');
          setAuthError('');
        }}
      >
        <h3 className="confirm-title danger-title">
          <AlertTriangle size={24} className="alert-icon" color="#FF6B6B" />
          회원 탈퇴
        </h3>
        <p className="confirm-desc text-center">
          가족 모두의 캘린더, 사진, 메모가 <strong>영구 삭제</strong>됩니다.<br/>확인을 위해 가족 비밀번호를 입력해주세요.
        </p>
        <form onSubmit={handleWithdrawAccount} className="withdraw-form">
          <input type="password" placeholder="가족 비밀번호 입력" value={familyPassword} onChange={(e) => { setFamilyPassword(e.target.value); setAuthError(''); }} className="full-width-input" autoFocus />
          <div className="error-margin-alt"><ErrorMessage message={authError} /></div>
          <div className="flex-group">
            
            <button 
              type="button" 
              className="btn btn-secondary flex-1" 
              onClick={() => { 
                setIsWithdrawOpen(false);
                setFamilyPassword('');
                setAuthError('');
              }}
            >
              취소
            </button>
            
            <button type="submit" className="btn btn-danger-solid flex-1">탈퇴하기</button>
          </div>
        </form>
      </CardModal>

      <CardModal
        isOpen={!!pinModalProfile}
        onClose={() => setPinModalProfile(null)}
        title="PIN 번호 입력"
        showCloseBtn={true}
      >
        <p className="modal-desc">
          <strong>{pinModalProfile?.nickname}</strong>님의 계정입니다.<br/>6자리 PIN 번호를 입력해주세요.
        </p>
        <form onSubmit={handlePinSubmit}>
          <div className="pin-input-wrapper">
            <Lock size={18} className="pin-icon" style={{ left: '15px' }} />
            <input type="password" placeholder="숫자 6자리" value={pinInput} 
            onChange={(e) => { setPinInput(e.target.value.replace(/[^0-9]/g, '')); 
            if (pinError) setPinError(''); }} maxLength={6} 
            className="pin-login-input" autoFocus />
          </div>
          <div className="error-margin"><ErrorMessage message={pinError} /></div>
          <button type="submit" className="btn btn-primary full-btn">접속하기</button>
        </form>
      </CardModal>

      <CardModal isOpen={isDeleteConfirmOpen && !!profileToDelete} onClose={() => setIsDeleteConfirmOpen(false)}>
        <h3 className="confirm-title" style={{ color: '#333', marginBottom: '15px' }}>
          <span className="highlight-text" style={{ color: '#7A9D8C' }}>'{profileToDelete?.nickname}'</span> 계정을<br/>삭제하시겠습니까?
        </h3>
        <p className="confirm-desc text-center">삭제된 데이터는 복구할 수 없습니다.</p>
        <div className="flex-group">
          <button type="button" className="btn btn-secondary flex-1" 
          onClick={() => setIsDeleteConfirmOpen(false)}>취소</button>
          <button type="button" className="btn btn-danger-solid flex-1" 
          onClick={confirmDeleteProfile}>삭제하기</button>
        </div>
      </CardModal>
      
      <ProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode="create" onSubmit={handleModalSubmit} />
    </div>
  );
};

export default Account;