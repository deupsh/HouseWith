import React, { useState, useRef } from 'react';
import './Gallery.css';

// 기본 더미 데이터 (초기 기본 앨범 및 사진 샘플)
const INITIAL_ALBUMS = ['기본 앨범', '가족 여행', '우리집 반려 동물'];
const INITIAL_PHOTOS = [
  { id: 1, title: '맛있는 저녁 식사', date: '2026-05-18', album: '기본 앨범', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', isCover: false },
  { id: 2, title: '제주도 바다에서', date: '2026-05-19', album: '가족 여행', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', isCover: true },
  { id: 3, title: '댕댕이 낮잠 시간', date: '2026-05-20', album: '우리집 반려 동물', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500', isCover: false },
];

const Gallery = () => {
  const [albums, setAlbums] = useState(INITIAL_ALBUMS);
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [currentAlbum, setCurrentAlbum] = useState('전체 보기'); // 현재 선택된 앨범 탭

  // 모달 상태 관리
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // 단건 조회용

  const [editingId, setEditingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  // 업로드 폼 상태 관리
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [albumInput, setAlbumInput] = useState('기본 앨범');
  
  // 새 앨범 직접 입력을 위한 상태 추가
  const [newAlbumInput, setNewAlbumInput] = useState('');
  const [isNewAlbum, setIsNewAlbum] = useState(false);

  const [photoUrl, setPhotoUrl] = useState(''); // 웹상 이미지 시뮬레이션용 URL
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // 모달 열기 (새로 추가)
  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setDate('');
    setAlbumInput('기본 앨범');
    setNewAlbumInput(''); // 초기화
    setIsNewAlbum(false); // 초기화
    setPhotoUrl('');
    setFileName('');
    setError('');
    setIsUploadOpen(true);
  };

  // 수정
  const handleOpenEdit = (photo) => {
    setEditingId(photo.id);
    setTitle(photo.title);
    setDate(photo.date);
    setAlbumInput(photo.album);
    setNewAlbumInput(''); // 초기화
    setIsNewAlbum(false); // 초기화
    setPhotoUrl(photo.url); // 기존 사진 URL 유지
    setFileName('사진 변경');
    setError('');
    setSelectedPhoto(null); // 상세 조회 모달 닫기
    setIsUploadOpen(true);
  };

  // 삭제 버튼 클릭 시 (확인 모달 띄우기)
  const handleDeleteClick = (id) => {
    setPhotoToDelete(id);
    setSelectedPhoto(null);
    setIsUploadOpen(false);
    setIsConfirmOpen(true);
  };

  // 실제 삭제 실행
  const confirmDelete = () => {
    setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoToDelete));
    setIsConfirmOpen(false);
    setPhotoToDelete(null);
  };

  // 파일 업로드 기능
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileName('');
      return;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError('사진 크기는 20MB를 초과할 수 없습니다.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    // 실제 서버가 없으므로 가상 URL 생성하여 시뮬레이션
    const fakeUrl = URL.createObjectURL(file);
    setPhotoUrl(fakeUrl);
    setFileName(file.name);
  };

  // 업로드/수정 제출 처리
  const handleUploadSubmit = (e) => {
    e.preventDefault();

    if (title.trim().length < 1 || title.trim().length > 20) {
      setError('제목은 1~20자 사이로 입력해 주세요.');
      return;
    }

    if (!editingId && !photoUrl) {
      setError('업로드할 사진을 선택해 주세요.');
      return;
    }

    // 날짜 미입력 시 오늘 날짜로 세팅
    const finalDate = date || new Date().toISOString().split('T')[0];
    
    // 앨범 값 결정 (앨범 직접 입력 모드일 경우 입력창의 값을 사용)
    const finalAlbum = isNewAlbum 
      ? (newAlbumInput.trim() || '기본 앨범') 
      : albumInput;

    if (isNewAlbum && newAlbumInput.trim().length > 20) {
      setError('앨범 이름은 20자 이내로 입력해 주세요.');
      return;
    }

    const newPhotoData = {
      title: title.trim(),
      date: finalDate,
      album: finalAlbum,
      url: photoUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500', // 미선택시 (예외처리)
    };

    if (editingId) {
      // 수정 로직
      setPhotos(photos.map(p => 
        p.id === editingId ? { ...p, ...newPhotoData } : p
      ));
    } else {
      // 추가 로직
      const newPhoto = { ...newPhotoData, id: Date.now(), isCover: false };
      setPhotos([newPhoto, ...photos]); // 최신 사진이 위로 오도록 추가
    }

    // 새로운 앨범일 경우 앨범 리스트에 추가
    if (!albums.includes(finalAlbum)) {
      setAlbums([...albums, finalAlbum]);
    }

    // 모달 닫기 및 초기화
    setIsUploadOpen(false);
    setTitle('');
    setDate('');
    setAlbumInput('기본 앨범');
    setNewAlbumInput('');
    setIsNewAlbum(false);
    setPhotoUrl('');
  };

  // 앨범별 대표 사진 설정 로직 구현
  const getAlbumCover = (albumName) => {
    const albumPhotos = photos.filter((p) => p.album === albumName);
    if (albumPhotos.length === 0) return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500'; // 사진 없을 때 기본 프리뷰

    // 1. 사용자가 설정한 대표 사진이 있는지 확인
    const explicitCover = albumPhotos.find((p) => p.isCover);
    if (explicitCover) return explicitCover.url;

    // 2. 미설정 시 날짜 기준 가장 최신 사진을 대표로 사용
    const sorted = [...albumPhotos].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].url;
  };

  // 대표 사진 변경 토글 함수
  const toggleSelectCover = (photoId, albumName, currentIsCover) => {
    setPhotos(
      photos.map((p) => {
        if (p.album === albumName) {
          if (p.id === photoId) {
            return { ...p, isCover: !currentIsCover }; // 클릭한 사진은 현재 상태의 반대로!
          }
          return { ...p, isCover: false }; // 다른 사진들은 무조건 대표 해제 (앨범당 1개 유지)
        }
        return p;
      })
    );
  };

  // 날짜 최신순으로 사진 정렬하여 필터링
  const filteredPhotos = photos
    .filter((p) => currentAlbum === '전체 보기' || p.album === currentAlbum)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순 정렬 기본 적용

  return (
    <div className="gallery-page">
      {/* 사진첩 상단 타이틀 */}
      <div className="gallery-header">
        <h2>우리의 추억 사진첩</h2>
        <p className="gallery-subtitle">함께 나누는 소중한 순간들</p>
      </div>

      {/* 앨범 선택 탭 공간 */}
      <div className="album-tabs-container">
        <button 
          className={`album-tab ${currentAlbum === '전체 보기' ? 'active' : ''}`}
          onClick={() => setCurrentAlbum('전체 보기')}
        >
          🖼️ 전체 보기
        </button>
        {albums.map((alb) => (
          <button
            key={alb}
            className={`album-tab ${currentAlbum === alb ? 'active' : ''}`}
            onClick={() => setCurrentAlbum(alb)}
          >
            <div className="tab-cover-mini" style={{ backgroundImage: `url(${getAlbumCover(alb)})` }} />
            {alb}
          </button>
        ))}
      </div>

      {/* 사진 리스트 조회 섹션 */}
      <div className="photo-grid-container">
        {filteredPhotos.length === 0 && <p className="empty-gallery-msg">이 앨범에 등록된 사진이 없습니다.</p>}
        {filteredPhotos.map((photo) => (
          <div key={photo.id} className="photo-card" onClick={() => setSelectedPhoto(photo)}>
            <div className="photo-img-wrapper" style={{ backgroundImage: `url(${photo.url})` }}>
              {photo.isCover && <span className="cover-badge">★ 대표</span>}
            </div>
            <div className="photo-card-info">
              <span className="photo-card-title">{photo.title}</span>
              <div className="photo-card-meta">
                <span className="photo-card-date">{photo.date}</span>
                <span className="photo-card-tag">#{photo.album}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="add-todo-btn gallery-upload-btn" onClick={handleOpenAdd}>
        + 새로운 사진 올리기
      </button>

      {/* ==================== 사진 업로드/수정 모달 ==================== */}
      {isUploadOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadOpen(false)}>
          <div className="modal-content gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-icon-btn" onClick={() => setIsUploadOpen(false)}>✕</button>
            <h2>{editingId ? '사진 정보 수정' : '사진 추가하기'}</h2>

            <form onSubmit={handleUploadSubmit} className="modal-form-container">
              <div className="form-field">
                <label>사진 선택 {editingId ? '(변경 시에만 선택)' : '(최대 20MB)'}</label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    id="custom-file-input" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    ref={fileInputRef} 
                    required={!editingId} 
                    className="hidden-file-input"
                  />
                  <label htmlFor="custom-file-input" className="custom-file-label">
                    <span className="file-icon">📸</span>
                    <span className="file-name">{fileName || '클릭해서 사진을 선택해주세요'}</span>
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label>사진 제목</label>
                <input
                  type="text"
                  placeholder="사진에 대한 짧은 제목 (1~20자)"
                  maxLength={20}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>촬영 날짜 <span className="sub-label">(미입력 시 오늘 날짜)</span></label>
                <input type="date" className="styled-date-input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              {/* 수정된 앨범 드롭다운 + 직접 입력 필드 */}
              <div className="form-field">
                <label>앨범 선택 <span className="sub-label">(미입력 시 기본 앨범)</span></label>
                <select 
                  className="styled-select" 
                  value={isNewAlbum ? 'new' : albumInput}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setIsNewAlbum(true);
                    } else {
                      setIsNewAlbum(false);
                      setAlbumInput(e.target.value);
                    }
                  }}
                >
                  {albums.map((a) => <option key={a} value={a}>{a}</option>)}
                  <option value="new">직접 입력</option>
                </select>

                {isNewAlbum && (
                  <input
                    type="text"
                    placeholder="새로운 앨범 이름을 입력하세요 (1~20자)"
                    maxLength={20}
                    value={newAlbumInput}
                    onChange={(e) => setNewAlbumInput(e.target.value)}
                    style={{ marginTop: '10px' }}
                    className="fade-in"
                  />
                )}
              </div>

              {error && <div className="gallery-error">{error}</div>}

              <div className="btn-group modal-btn-margin">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? '저장하기' : '업로드 하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 사진 단건 상세 조회 모달 ==================== */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content detail-photo-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-icon-btn" onClick={() => setSelectedPhoto(null)}>✕</button>
            <h2>사진 상세 보기</h2>

            <div className="detail-photo-view">
              <img src={selectedPhoto.url} alt={selectedPhoto.title} className="detail-photo-img" />
            </div>

            <div className="detail-photo-info">
              <h3>{selectedPhoto.title}</h3>
              <div className="detail-photo-meta">
                <span>📅 {selectedPhoto.date}</span>
                <span>📁 앨범: {selectedPhoto.album}</span>
              </div>
            </div>

            {/* 수정 / 삭제 버튼 */}
            <div className="btn-group btn-group-two modal-btn-margin">
              <button type="button" className="btn btn-primary" onClick={() => handleOpenEdit(selectedPhoto)}>수정하기</button>
              <button type="button" className="btn btn-danger" onClick={() => handleDeleteClick(selectedPhoto.id)}>삭제</button>
            </div>

            <button
              type="button"
              className={`btn ${selectedPhoto.isCover ? 'btn-secondary' : 'btn-yellow'}`}
              style={{ width: '100%', marginTop: '10px', boxShadow: 'none' }}
              onClick={() => {
                toggleSelectCover(selectedPhoto.id, selectedPhoto.album, selectedPhoto.isCover);
                setSelectedPhoto({ ...selectedPhoto, isCover: !selectedPhoto.isCover });
              }}
            >
              {selectedPhoto.isCover ? '★ 대표 사진 해제' : '⭐ 이 앨범의 대표 사진으로 설정'}
            </button>
          </div>
        </div>
      )}

      {/* ==================== 삭제 확인 커스텀 모달 ==================== */}
      {isConfirmOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setIsConfirmOpen(false)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <h3 className="confirm-title" style={{ lineHeight: '1.4' }}>
              <span style={{ color: '#7A9D8C' }}>'{photos.find(p => p.id === photoToDelete)?.title}'</span> 사진을<br/>
              삭제하시겠습니까?
            </h3>
            <p className="confirm-desc" style={{ marginTop: '12px' }}>삭제된 사진은 복구할 수 없습니다.</p>
            
            <div className="btn-group" style={{ marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsConfirmOpen(false)}>취소</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>삭제하기</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;