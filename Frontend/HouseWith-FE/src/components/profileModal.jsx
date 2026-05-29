import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Check, Lock, LogOut, Shield, Info } from 'lucide-react'; // 🚨 Bell 아이콘 삭제
import { useNavigate } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';
import CardModal from './CardModal';
import { iconList, colorList } from '../constants/profileOptions'; 

const ProfileModal = ({ isOpen, onClose, mode = 'create', initialData, onSubmit }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [mainTab, setMainTab] = useState('edit');
  const [activeTab, setActiveTab] = useState(0); 
  const [nickname, setNickname] = useState('');
  const [pinCode, setPinCode] = useState(''); 
  const [emojiId, setEmojiId] = useState(0);
  const [backgroundId, setBackgroundId] = useState(0);
  const [customImage, setCustomImage] = useState(null);
  // 🚨 isPushEnabled 상태 삭제 완료
  const [accountEmail, setAccountEmail] = useState('');
  const [accountGroupName, setAccountGroupName] = useState('');

  // 로그아웃 확인 모달 상태 추가
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const [errors, setErrors] = useState({ nickname: '', pin: '', photo: '' });

  // 🚨 [추가] 이미지 경로를 안전하게 변환해주는 헬퍼 함수
  const getSafeImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // DB 경로(시작이 '/')일 경우, 한글/공백을 안전하게 인코딩(encodeURI)해서 합쳐줍니다.
    if (imagePath.startsWith('/')) {
      return `http://${window.location.hostname}/uploads${encodeURI(imagePath)}`;
    }
    // 방금 업로드한 Base64 데이터면 그대로 반환
    return imagePath;
  };

  useEffect(() => {
    if (isOpen) {
      setMainTab('edit');
      if (mode === 'edit' && initialData) {
        setActiveTab(initialData.profile_type);
        setNickname(initialData.nickname);
        setEmojiId(initialData.emoji_id);
        setBackgroundId(initialData.background_id);
        setCustomImage(initialData.custom_profile_image);
        setPinCode('');
        setAccountGroupName(localStorage.getItem('groupName') || '소속 그룹 없음');
        setAccountEmail(localStorage.getItem('email') || '이메일 정보 없음');
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

    if (hasError) {
      setErrors(newErrors);
      return; 
    }

    const submitData = {
      id: initialData?.profile_id,
      nickname,
      pin_code: pinCode || null,
      // 숫자를 문자열로 확실하게 변환해서 전달
      profile_type: String(activeTab), 
      emoji_id: activeTab === 0 ? String(emojiId) : "0",
      background_id: activeTab === 0 ? String(backgroundId) : "0",
    };

    // 2. 파일 처리 방어 로직 추가
    if (activeTab === 1 && fileInputRef.current && fileInputRef.current.files[0]) {
        // 사진 탭이고, 새 사진을 올렸을 때만 추가
        submitData.profileImage = fileInputRef.current.files[0];
    } else if (activeTab === 0) {
        // 이모지 탭일 때는 사진 파일이 가지 않도록 방어
        submitData.profileImage = null; 
    }

    onSubmit(submitData);
  };

  // 로그아웃 실행 함수
  const confirmLogout = () => {
    localStorage.removeItem('accessToken');
    onClose();
    setIsLogoutConfirmOpen(false);
    navigate('/login'); 
    window.location.reload(); 
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '0', overflow: 'hidden' }}>
        
        <div className="modal-header" style={{ padding: '20px 20px 0 20px', borderBottom: 'none' }}>
          <h3 style={{ fontSize: '1.4rem' }}>{mode === 'create' ? '프로필 만들기' : '내 정보'}</h3>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

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
                  maxLength={10} 
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
                      maxLength={6} 
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
                      <div className="photo-upload-zone-card" onClick={() => fileInputRef.current.click()}>
                        <input type="file" ref={fileInputRef} hidden onChange={handlePhotoUpload} accept="image/*" />
                        {customImage ? (
                          <img 
                            src={getSafeImageUrl(customImage)} 
                            alt="upload preview" 
                            className="uploaded-preview-img" 
                          />
                        ) : (
                          <div className="upload-placeholder">...</div>
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
                      customImage ? <img src={getSafeImageUrl(customImage)} alt="preview" className="avatar-img" /> : <Camera color="#ccc"/>
                    ) : (
                      <img src={iconList[emojiId]} alt="preview-icon" className="avatar-img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    )}
                  </div>
                  <span className="profile-name" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{nickname || '이름'}</span>
                </div>
              </div>
            </div>
          )}

          {mainTab === 'settings' && (
            <div className="settings-tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              <section>
                <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} /> 계정 정보
                </h4>
                <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#555' }}>이메일</span>
                    <span style={{ fontWeight: '500', color: '#333' }}>{accountEmail}</span> 
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#555' }}>소속 그룹</span>
                    <span style={{ fontWeight: '500', color: '#333' }}>{accountGroupName}</span>
                  </div>
                </div>
              </section>

              <section>
                <h4 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={16} /> 계정 관리
                </h4>
                <button 
                  onClick={() => setIsLogoutConfirmOpen(true)} // 로그아웃 모달 띄우기
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '15px', borderRadius: '12px' }}
                >
                  <LogOut size={18} /> 로그아웃
                </button>
              </section>

              <div style={{ textAlign: 'center', color: '#bbb', fontSize: '0.8rem', marginTop: '10px' }}>
                HouseWith App v1.0.0
              </div>
            </div>
          )}

        </div>

        {mainTab === 'edit' && (
          <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid #eee' }}>
            <button className="btn-cancel" onClick={onClose} style={{ flex: 1 }}>취소</button>
            <button className="btn-add" onClick={handleSubmit} style={{ flex: 1 }}>
              {mode === 'create' ? '추가하기' : '저장하기'}
            </button>
          </div>
        )}
      </div>

      {/* 로그아웃 확인용 공통 카드 모달 */}
      <CardModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        title="로그아웃"
      >
        <p className="confirm-desc text-center">정말 로그아웃 하시겠습니까?</p>
        <div className="flex-group">
          <button 
            className="btn btn-secondary flex-1" 
            onClick={() => setIsLogoutConfirmOpen(false)}
          >
            취소
          </button>
          <button 
            className="btn btn-danger-solid flex-1" 
            onClick={confirmLogout}
            style={{ backgroundColor: '#FF6B6B' }}
          >
            로그아웃
          </button>
        </div>
      </CardModal>

    </div>
  );
};

export default ProfileModal;