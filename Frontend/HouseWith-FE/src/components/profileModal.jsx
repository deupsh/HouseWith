import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Check, Lock, LogOut, Trash2, Bell, Shield, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 🌟 라우터 이동을 위한 임포트 추가
import ErrorMessage from './ErrorMessage';
import { iconList, colorList } from '../constants/profileOptions'; 

const ProfileModal = ({ isOpen, onClose, mode = 'create', initialData, onSubmit }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // 🌟 상단 메인 탭 상태 ('edit' = 프로필 수정, 'settings' = 설정)
  const [mainTab, setMainTab] = useState('edit');

  // 폼 입력 상태들
  const [activeTab, setActiveTab] = useState(0); 
  const [nickname, setNickname] = useState('');
  const [pinCode, setPinCode] = useState(''); 
  const [emojiId, setEmojiId] = useState(0);
  const [backgroundId, setBackgroundId] = useState(0);
  const [customImage, setCustomImage] = useState(null);

  // 🌟 추가 설정 상태 (알림 토글 등)
  const [isPushEnabled, setIsPushEnabled] = useState(true);

  const [errors, setErrors] = useState({ nickname: '', pin: '', photo: '' });

  // 모달이 열릴 때 mode(생성/수정)에 따라 입력창 초기값 세팅
  useEffect(() => {
    if (isOpen) {
      setMainTab('edit'); // 모달이 열릴 때마다 기본 탭을 '프로필 수정'으로 초기화
      if (mode === 'edit' && initialData) {
        setActiveTab(initialData.profile_type);
        setNickname(initialData.nickname);
        setEmojiId(initialData.emoji_id);
        setBackgroundId(initialData.background_id);
        setCustomImage(initialData.custom_profile_image);
        setPinCode('');
      } else {
        setActiveTab(0);
        setNickname('');
        setPinCode('');
        setEmojiId(0);
        setBackgroundId(0);
        setCustomImage(null);
      }
      setErrors({ nickname: '', pin: '', photo: '' });
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result);
        setErrors({ ...errors, photo: '' }); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    let hasError = false;
    let newErrors = { nickname: '', pin: '', photo: '' };

    if (!nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
      hasError = true;
    }
    
    if (mode === 'create' && pinCode && pinCode.length !== 6) {
      newErrors.pin = 'PIN 번호는 6자리로 입력해주세요.';
      hasError = true;
    }

    if (activeTab === 1 && !customImage) {
      newErrors.photo = '프로필 사진을 업로드해주세요.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return; 
    }

    onSubmit({
      nickname,
      pin_code: mode === 'create' ? (pinCode || null) : undefined,
      profile_type: activeTab,
      emoji_id: activeTab === 0 ? emojiId : 0,
      background_id: activeTab === 0 ? backgroundId : 0,
      custom_profile_image: activeTab === 1 ? customImage : null
    });
  };

  // 🌟 로그아웃 처리 함수
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('accessToken');
      onClose();
      navigate('/login'); 
      window.location.reload(); 
    }
  };

  // 🌟 회원탈퇴 처리 함수
  const handleDeleteAccount = async () => {
    if (window.confirm('정말로 탈퇴하시겠습니까? 우리 가족의 모든 기록에서 제외되며 복구할 수 없습니다.')) {
      try {
        // 추후 API 연동 시 아래 주석 해제
        // const token = localStorage.getItem('accessToken');
        // await axios.delete('/api/members/me', { headers: { Authorization: `Bearer ${token}` } });
        
        alert('회원탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
        localStorage.removeItem('accessToken');
        onClose();
        navigate('/login');
        window.location.reload();
      } catch (error) {
        console.error('탈퇴 실패:', error);
        alert('탈퇴 처리 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '0', overflow: 'hidden' }}>
        
        {/* 🌟 모달 헤더 (타이틀 변경) */}
        <div className="modal-header" style={{ padding: '20px 20px 0 20px', borderBottom: 'none' }}>
          <h3 style={{ fontSize: '1.4rem' }}>{mode === 'create' ? '프로필 만들기' : '내 정보'}</h3>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

        {/* 🌟 수정 모드일 때만 메인 탭 2개 렌더링 */}
        {mode === 'edit' && (
          <div className="main-tabs-container" style={{ display: 'flex', borderBottom: '1px solid #eee', marginTop: '15px' }}>
            <button 
              style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: mainTab === 'edit' ? '2px solid #7A9D8C' : '2px solid transparent', color: mainTab === 'edit' ? '#7A9D8C' : '#888', fontWeight: mainTab === 'edit' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setMainTab('edit')}
            >
              프로필 수정
            </button>
            <button 
              style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: mainTab === 'settings' ? '2px solid #7A9D8C' : '2px solid transparent', color: mainTab === 'settings' ? '#7A9D8C' : '#888', fontWeight: mainTab === 'settings' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setMainTab('settings')}
            >
              설정
            </button>
          </div>
        )}

        <div className="modal-body" style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
          
          {/* =======================================
              [탭 1] 프로필 수정 내용
          ======================================= */}
          {mainTab === 'edit' && (
            <div className="edit-tab-content fade-in">
              <div className="input-group">
                <label>닉네임</label>
                <input 
                  type="text" placeholder="2~10자" value={nickname} 
                  onChange={(e) => {
                    setNickname(e.target.value);
                    if (errors.nickname) setErrors({ ...errors, nickname: '' });
                  }} 
                  maxLength={10} className={errors.nickname ? 'input-error' : ''} 
                />
                <ErrorMessage message={errors.nickname} />
              </div>
              
              {mode === 'create' && (
                <div className="input-group">
                  <label>PIN 비밀번호 <span style={{ color: '#aaa', fontSize: '0.8rem', fontWeight: '400' }}>(선택)</span></label>
                  <div className="pin-input-wrapper">
                    <Lock size={16} className="pin-icon" />
                    <input 
                      type="password" placeholder="숫자 6자리" value={pinCode} 
                      onChange={(e) => {
                        setPinCode(e.target.value.replace(/[^0-9]/g, ''));
                        if (errors.pin) setErrors({ ...errors, pin: '' });
                      }} 
                      maxLength={6} className={errors.pin ? 'input-error' : ''} 
                    />
                  </div>
                  <ErrorMessage message={errors.pin} />
                </div>
              )}

              <div className="profile-type-section-card"> 
                <div className="profile-type-tabs">
                  <button className={`type-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>기본 이모지</button>
                  <button className={`type-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>사진 업로드</button>
                </div>

                <div className="type-content-area">
                  {activeTab === 0 && (
                    <div className="type-content">
                      <div className="input-group">
                        <label>아이콘 선택</label>
                        <div className="selection-grid">
                          {iconList.map((icon, index) => (
                            <div key={index} className={`icon-item ${emojiId === index ? 'active' : ''}`} onClick={() => setEmojiId(index)}>
                              <img src={icon} alt={`icon-${index}`} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="input-group">
                        <label>배경색 선택</label>
                        <div className="selection-grid colors">
                          {colorList.map((color, index) => (
                            <div key={index} className={`color-item ${backgroundId === index ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => setBackgroundId(index)}>
                              {backgroundId === index && <Check size={16} color="white" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 1 && (
                    <div className="type-content">
                      <div className={`photo-upload-zone-card ${errors.photo ? 'box-error' : ''}`} onClick={() => fileInputRef.current.click()}>
                        <input type="file" ref={fileInputRef} hidden onChange={handlePhotoUpload} accept="image/*" />
                        {customImage ? (
                          <img src={customImage} alt="upload preview" className="uploaded-preview-img" />
                        ) : (
                          <div className="upload-placeholder">
                            <Camera size={40} />
                            <p>클릭하여 사진 선택</p>
                          </div>
                        )}
                      </div>
                      <ErrorMessage message={errors.photo} style={{ textAlign: 'center', display: 'block', marginTop: '10px' }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="preview-section" style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>미리보기</p>
                <div className="preview-card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
                  <div className="avatar-box" style={{ width: '60px', height: '60px', backgroundColor: activeTab === 0 ? colorList[backgroundId] : 'transparent' }}>
                    {activeTab === 1 ? (
                      customImage ? <img src={customImage} alt="preview" className="avatar-img" /> : <Camera color="#ccc"/>
                    ) : (
                      <img src={iconList[emojiId]} alt="preview-icon" className="avatar-img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    )}
                  </div>
                  <span className="profile-name" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{nickname || '이름'}</span>
                </div>
              </div>
            </div>
          )}

          {/* =======================================
              [탭 2] 설정 내용 (이메일, 로그아웃, 탈퇴 등)
          ======================================= */}
          {mainTab === 'settings' && (
            <div className="settings-tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              <section>
                <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} /> 계정 정보
                </h4>
                <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#555' }}>이메일</span>
                    <span style={{ fontWeight: '500', color: '#333' }}>hong@family.com</span> 
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#555' }}>소속 그룹</span>
                    <span style={{ fontWeight: '500', color: '#333' }}>홍가네</span>
                  </div>
                </div>
              </section>

              <section>
                <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={16} /> 앱 설정
                </h4>
                <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#333', fontWeight: '500' }}>새로운 알림 받기</span>
                  <label className="toggle-switch" style={{ margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={isPushEnabled} 
                      onChange={() => setIsPushEnabled(!isPushEnabled)} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </section>

              <section>
                <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={16} /> 계정 관리
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={handleLogout}
                    style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fff', border: '1px solid #ddd', borderRadius: '12px', color: '#333', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <LogOut size={18} /> 로그아웃
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FFF5F5', border: '1px solid #FFE3E3', borderRadius: '12px', color: '#E03131', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <Trash2 size={18} /> 회원탈퇴
                  </button>
                </div>
              </section>

              <div style={{ textAlign: 'center', color: '#bbb', fontSize: '0.8rem', marginTop: '10px' }}>
                HouseWith App v1.0.0
              </div>
            </div>
          )}

        </div>

        {/* 🌟 설정 탭일 때는 하단의 확인/취소 버튼 숨김 처리 */}
        {mainTab === 'edit' && (
          <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid #eee' }}>
            <button className="btn-cancel" onClick={onClose} style={{ flex: 1 }}>취소</button>
            <button className="btn-add" onClick={handleSubmit} style={{ flex: 1 }}>
              {mode === 'create' ? '추가하기' : '저장하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;