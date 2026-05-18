import React, { useState, useRef } from 'react';
import { X, Camera, Check, Lock } from 'lucide-react';
import './Account.css';

const Account = ({ onSelect }) => {
  // DB 설계도에 맞춘 인덱스 매핑 배열 (실제 백엔드와 동일하게 맞추시면 됩니다)
  const iconList = ['👩', '👨', '👧', '👦', '👵', '👴', '👶', '🐶', '🐱'];
  const colorList = ['#E8EFEA', '#F6EBE1', '#FDF0EC', '#EAF0EB', '#D0DEE1', '#E9D6C4', '#E4C9B5', '#9BA99E'];

  // 초기 더미 데이터 (DB 스키마 구조 반영)
  const [profiles, setProfiles] = useState([
    { profile_id: 1, nickname: '엄마', profile_type: 0, emoji_id: 0, background_id: 0, custom_profile_image: null },
    { profile_id: 2, nickname: '아빠', profile_type: 0, emoji_id: 1, background_id: 1, custom_profile_image: null },
    { profile_id: 3, nickname: '딸', profile_type: 0, emoji_id: 2, background_id: 2, custom_profile_image: null },
    { profile_id: 4, nickname: '아들', profile_type: 0, emoji_id: 3, background_id: 3, custom_profile_image: null },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  // 폼 입력 상태 (DB 컬럼명과 매칭)
  const [activeTab, setActiveTab] = useState(0); // 0: 기본 이모지, 1: 사진 업로드 ★ 활성 탭 상태 관리
  const [nickname, setNickname] = useState('');
  const [pinCode, setPinCode] = useState(''); 
  const [emojiId, setEmojiId] = useState(0);
  const [backgroundId, setBackgroundId] = useState(0);
  const [customImage, setCustomImage] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = () => {
    if (!nickname) return alert("닉네임을 입력해주세요!");
    if (activeTab === 1 && !customImage) return alert("사진을 업로드해주세요!"); // 사진 업로드 탭 확인

    const newMember = {
      profile_id: Date.now(), // 임시 PK
      nickname: nickname,
      pin_code: pinCode || null,
      profile_type: activeTab, // profile_type은 활성 탭으로 설정
      emoji_id: activeTab === 0 ? emojiId : 0, // 기본 이모지 탭인 경우에만 이모지 ID 저장
      background_id: activeTab === 0 ? backgroundId : 0, // 기본 이모지 탭인 경우에만 배경 ID 저장
      custom_profile_image: activeTab === 1 ? customImage : null // 사진 업로드 탭인 경우에만 커스텀 이미지 저장
    };

    setProfiles([...profiles, newMember]);
    setIsModalOpen(false);
    
    // 초기화
    setNickname(''); setPinCode(''); setCustomImage(null); setActiveTab(0);
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">누구세요?</h1>

      <div className="profile-grid">
        {profiles.map((profile) => (
          <button key={profile.profile_id} className="profile-card" onClick={() => onSelect(profile)}>
            {/* DB 데이터 기반 렌더링 로직 */}
            <div 
              className="avatar-box" 
              style={{ backgroundColor: profile.profile_type === 0 ? colorList[profile.background_id] : 'transparent' }}
            >
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

      {/* --- 가족 구성원 추가 모달 --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>프로필 만들기</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X /></button>
            </div>

            <div className="modal-body">
              <div className="input-group">
                <label>닉네임</label>
                <input type="text" placeholder="2~10자" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={10} />
              </div>
              
              <div className="input-group">
                <label>PIN 비밀번호</label>
                <div className="pin-input-wrapper">
                  <Lock size={16} className="pin-icon" />
                  <input type="password" placeholder="숫자 6자리 (선택사항)" value={pinCode} onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))} maxLength={6} />
                </div>
              </div>

              {/* 🌟 프로필 유형 선택 탭 (곡선형 카드 섹션) */}
              <div className="profile-type-section-card"> 
                <div className="profile-type-tabs">
                  <button className={`type-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>기본 이모지</button>
                  <button className={`type-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>내 사진 업로드</button>
                </div>

                <div className="type-content-area">
                  {/* [유형 0] 이모지 선택 모드 */}
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

                  {/* [유형 1] 커스텀 이미지 모드 */}
                  {activeTab === 1 && (
                    <div className="type-content">
                      <div className="photo-upload-zone-card" onClick={() => fileInputRef.current.click()}>
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
                    </div>
                  )}
                </div>
              </div>

              {/* 미리보기 (탭 선택에 따라 다르게 표시) */}
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
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="btn-add" onClick={handleAddMember}>추가하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;