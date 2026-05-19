import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Check, Lock } from 'lucide-react';
import ErrorMessage from './ErrorMessage';
import { iconList, colorList } from '../constants/profileOptions'; // 1단계에서 만든 상수 불러오기

const ProfileModal = ({ isOpen, onClose, mode = 'create', initialData, onSubmit }) => {
  const fileInputRef = useRef(null);
  
  // 폼 입력 상태들
  const [activeTab, setActiveTab] = useState(0); 
  const [nickname, setNickname] = useState('');
  const [pinCode, setPinCode] = useState(''); 
  const [emojiId, setEmojiId] = useState(0);
  const [backgroundId, setBackgroundId] = useState(0);
  const [customImage, setCustomImage] = useState(null);

  const [errors, setErrors] = useState({ nickname: '', pin: '', photo: '' });

  // 🌟 모달이 열릴 때 mode(생성/수정)에 따라 입력창 초기값 세팅
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        // 수정 모드일 때는 현재 프로필 정보로 채움
        setActiveTab(initialData.profile_type);
        setNickname(initialData.nickname);
        setEmojiId(initialData.emoji_id);
        setBackgroundId(initialData.background_id);
        setCustomImage(initialData.custom_profile_image);
        setPinCode('');
      } else {
        // 생성 모드일 때는 깔끔하게 빈 칸으로 초기화
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
    
    // 생성 모드이면서 PIN을 입력했을 때만 6자리 검사
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

    // 검증 완료 후 입력된 데이터를 부모(Account 또는 Navigation)에게 전달
    onSubmit({
      nickname,
      pin_code: mode === 'create' ? (pinCode || null) : undefined,
      profile_type: activeTab,
      emoji_id: activeTab === 0 ? emojiId : 0,
      background_id: activeTab === 0 ? backgroundId : 0,
      custom_profile_image: activeTab === 1 ? customImage : null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{mode === 'create' ? '프로필 만들기' : '프로필 수정'}</h3>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

        <div className="modal-body">
          {/* 닉네임 */}
          <div className="input-group">
            <label>닉네임</label>
            <input 
              type="text" 
              placeholder="2~10자" 
              value={nickname} 
              onChange={(e) => {
                setNickname(e.target.value);
                if (errors.nickname) setErrors({ ...errors, nickname: '' });
              }} 
              maxLength={10} 
              className={errors.nickname ? 'input-error' : ''} 
            />
            <ErrorMessage message={errors.nickname} />
          </div>
          
          {/* PIN 비밀번호 (생성 모드일 때만 렌더링) */}
          {mode === 'create' && (
            <div className="input-group">
              <label>PIN 비밀번호 <span style={{ color: '#aaa', fontSize: '0.8rem', fontWeight: '400' }}>(선택)</span></label>
              <div className="pin-input-wrapper">
                <Lock size={16} className="pin-icon" />
                <input 
                  type="password" 
                  placeholder="숫자 6자리" 
                  value={pinCode} 
                  onChange={(e) => {
                    setPinCode(e.target.value.replace(/[^0-9]/g, ''));
                    if (errors.pin) setErrors({ ...errors, pin: '' });
                  }} 
                  maxLength={6} 
                  className={errors.pin ? 'input-error' : ''} 
                />
              </div>
              <ErrorMessage message={errors.pin} />
            </div>
          )}

          {/* 프로필 유형 선택 카드 */}
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
                          {icon}
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

          {/* 미리보기 */}
          <div className="preview-section">
            <p>미리보기</p>
            <div className="preview-card">
               <div className="avatar-box" style={{ backgroundColor: activeTab === 0 ? colorList[backgroundId] : 'transparent' }}>
                  {activeTab === 1 ? (
                    customImage ? <img src={customImage} alt="preview" className="avatar-img" /> : <Camera color="#ccc"/>
                  ) : (
                    <span className="avatar-emoji">{iconList[emojiId]}</span>
                  )}
               </div>
               <span className="profile-name">{nickname || '이름'}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>취소</button>
          <button className="btn-add" onClick={handleSubmit}>
            {mode === 'create' ? '추가하기' : '수정 완료'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;