import React, { useState } from 'react';
import './Gallery.css';
import PhotoFormModal from './PhotoFormModal'; // 🌟 새로 만든 모달 컴포넌트 불러오기!

const INITIAL_ALBUMS = ['기본 앨범', '가족 여행', '우리집 반려 동물'];
const INITIAL_PHOTOS = [
  { id: 1, title: '맛있는 저녁 식사', date: '2026-05-18', album: '기본 앨범', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', isCover: false },
  { id: 2, title: '제주도 바다에서', date: '2026-05-19', album: '가족 여행', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', isCover: true },
  { id: 3, title: '댕댕이 낮잠 시간', date: '2026-05-20', album: '우리집 반려 동물', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500', isCover: false },
];

const Gallery = () => {
  const [albums, setAlbums] = useState(INITIAL_ALBUMS);
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [currentAlbum, setCurrentAlbum] = useState('전체 보기'); 

  // 화면/모달 상태
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const [editingPhoto, setEditingPhoto] = useState(null); 
  
  // 삭제 확인 모달 상태
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  const handleOpenAdd = () => {
    setEditingPhoto(null);
    setIsUploadOpen(true);
  };

  const handleOpenEdit = (photo) => {
    setEditingPhoto(photo);
    setSelectedPhoto(null); 
    setIsUploadOpen(true);
  };

  const handleDeleteClick = (id) => {
    setPhotoToDelete(id);
    setSelectedPhoto(null);
    setIsUploadOpen(false);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoToDelete));
    setIsConfirmOpen(false);
    setPhotoToDelete(null);
  };

  // 모달창에서 '저장'을 눌렀을 때 실행되는 함수
  const handleSavePhoto = (photoData) => {
    if (editingPhoto) {
      setPhotos(photos.map(p => p.id === editingPhoto.id ? { ...p, ...photoData } : p));
    } else {
      const newPhoto = { ...photoData, id: Date.now(), isCover: false };
      setPhotos([newPhoto, ...photos]); 
    }

    if (!albums.includes(photoData.album)) {
      setAlbums([...albums, photoData.album]);
    }
    setIsUploadOpen(false);
  };

  const getAlbumCover = (albumName) => {
    const albumPhotos = photos.filter((p) => p.album === albumName);
    if (albumPhotos.length === 0) return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500'; 

    const explicitCover = albumPhotos.find((p) => p.isCover);
    if (explicitCover) return explicitCover.url;

    const sorted = [...albumPhotos].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].url;
  };

  const toggleSelectCover = (photoId, albumName, currentIsCover) => {
    setPhotos(
      photos.map((p) => {
        if (p.album === albumName) {
          if (p.id === photoId) return { ...p, isCover: !currentIsCover }; 
          return { ...p, isCover: false }; 
        }
        return p;
      })
    );
  };

  const filteredPhotos = photos
    .filter((p) => currentAlbum === '전체 보기' || p.album === currentAlbum)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); 

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h2>우리의 추억 사진첩</h2>
        <p className="gallery-subtitle">함께 나누는 소중한 순간들</p>
      </div>

      <div className="album-tabs-container">
        <button className={`album-tab ${currentAlbum === '전체 보기' ? 'active' : ''}`} onClick={() => setCurrentAlbum('전체 보기')}>
          🖼️ 전체 보기
        </button>
        {albums.map((alb) => (
          <button key={alb} className={`album-tab ${currentAlbum === alb ? 'active' : ''}`} onClick={() => setCurrentAlbum(alb)}>
            <div className="tab-cover-mini" style={{ backgroundImage: `url(${getAlbumCover(alb)})` }} />
            {alb}
          </button>
        ))}
      </div>

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

      {/* 🌟 분리된 업로드/수정 모달 컴포넌트 연결 완료! */}
      {isUploadOpen && (
        <PhotoFormModal
          onClose={() => setIsUploadOpen(false)}
          onSave={handleSavePhoto}
          editingPhoto={editingPhoto}
          albums={albums}
          onDeleteClick={handleDeleteClick}
        />
      )}

      {/* 사진 단건 상세 조회 모달 */}
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

      {/* 삭제 확인 커스텀 모달 */}
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