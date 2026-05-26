import React, { useState, useEffect } from 'react';
import './Gallery.css';
import axios from 'axios';
import PhotoFormModal from './PhotoFormModal';

// 🚨 백엔드 연결 전 UI 테스트용 가짜 데이터
const INITIAL_ALBUMS = ['기본 앨범', '가족 여행', '우리집 반려 동물'];
const INITIAL_PHOTOS = [
  { id: 1, title: '맛있는 저녁 식사', date: '2026-05-18', album: '기본 앨범', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', isThumbnail: false },
  { id: 2, title: '제주도 바다에서', date: '2026-05-19', album: '가족 여행', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', isThumbnail: true },
  { id: 3, title: '댕댕이 낮잠 시간', date: '2026-05-20', album: '우리집 반려 동물', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500', isThumbnail: false },
];

const Gallery = () => {
  // API로 채울 예정
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState('전체 보기'); 

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const [editingPhoto, setEditingPhoto] = useState(null); 
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  // 전체 사진 목록 가져오기 (GET)
  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const currentProfileId = localStorage.getItem('currentSlotId'); // 현재 로그인된 프로필 ID 꺼내기
      const response = await axios.get('/api/photos', {
        headers: { Authorization: `Bearer ${token}` ,
        ProfileId: currentProfileId
      }});
      
      setPhotos(response.data);
      
      // 사진 데이터에서 앨범 이름만 중복 없이 추출해서 앨범 목록 생성
      const fetchedAlbums = [...new Set(response.data.map(p => p.album))];
      setAlbums(['기본 앨범', ...fetchedAlbums.filter(a => a !== '기본 앨범')]);
      
    } catch (error) {
      console.error("사진첩 조회 실패 (서버 미준비):", error);
      // 에러 시 임시 더미 데이터 세팅
      setPhotos(INITIAL_PHOTOS);
      setAlbums(INITIAL_ALBUMS);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

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

  // 3. 사진 삭제하기 (DELETE)
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`/api/photos/${photoToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoToDelete));
      
    } catch (error) {
      console.error("사진 삭제 실패:", error);
      // Fallback: 로컬 삭제
      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoToDelete));
    } finally {
      setIsConfirmOpen(false);
      setPhotoToDelete(null);
    }
  };

  // 4. 사진 업로드 및 수정 (POST / PUT)
  const handleSavePhoto = async (photoData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const currentProfileId = localStorage.getItem('currentSlotId');
      
      if (editingPhoto) {
        // [수정 - PUT]
        const response = await axios.put(`/api/photos/${editingPhoto.id}`, photoData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPhotos(photos.map(p => p.id === editingPhoto.id ? response.data : p));
      } else {
        // [등록 - POST]
        const response = await axios.post('/api/photos', photoData, {
          headers: { Authorization: `Bearer ${token}` } // (주의: 실제 파일 업로드 시에는 Content-Type: multipart/form-data 가 필요할 수 있습니다)
        });
        setPhotos([response.data, ...photos]); 
      }

      if (!albums.includes(photoData.album)) {
        setAlbums([...albums, photoData.album]);
      }
      setIsUploadOpen(false);

    } catch (error) {
      console.error("사진 저장 실패:", error);
      
      // Fallback: 로컬 저장
      if (editingPhoto) {
        setPhotos(photos.map(p => p.id === editingPhoto.id ? { ...p, ...photoData } : p));
      } else {
        const newPhoto = { ...photoData, id: Date.now(), isThumbnail: false };
        setPhotos([newPhoto, ...photos]); 
      }
      if (!albums.includes(photoData.album)) {
        setAlbums([...albums, photoData.album]);
      }
      setIsUploadOpen(false);
    }
  };

  // 🌟 5. 대표 사진 설정 (PATCH 또는 PUT)
  const toggleSelectThumbnail = async (photoId, albumName, currentIsThumbnail) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // 특정 앨범의 대표 사진 상태만 토글 업데이트
      await axios.patch(`/api/photos/${photoId}/thumbnail`, 
        { isThumbnail: !currentIsThumbnail, album: albumName }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // 성공하면 프론트엔드 화면 즉시 갱신
      updateLocalThumbnail(photoId, albumName, currentIsThumbnail);

    } catch (error) {
      console.error("대표 사진 변경 실패:", error);
      // Fallback: 로컬 업데이트
      updateLocalThumbnail(photoId, albumName, currentIsThumbnail);
    }
  };

  // 대표 사진 변경 로컬 업데이트 함수 (중복 제거용)
  const updateLocalThumbnail = (photoId, albumName, currentIsThumbnail) => {
    setPhotos(
      photos.map((p) => {
        if (p.album === albumName) {
          if (p.id === photoId) return { ...p, isThumbnail: !currentIsThumbnail }; 
          return { ...p, isThumbnail: false }; 
        }
        return p;
      })
    );
  };

  const getAlbumCover = (albumName) => {
    const albumPhotos = photos.filter((p) => p.album === albumName);
    if (albumPhotos.length === 0) return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500'; 

    const explicitCover = albumPhotos.find((p) => p.isThumbnail);
    if (explicitCover) return explicitCover.url;

    const sorted = [...albumPhotos].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].url;
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
              {photo.isThumbnail && <span className="cover-badge">★ 대표</span>}
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

      {isUploadOpen && (
        <PhotoFormModal
          onClose={() => setIsUploadOpen(false)}
          onSave={handleSavePhoto}
          editingPhoto={editingPhoto}
          albums={albums}
          onDeleteClick={handleDeleteClick}
        />
      )}

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
              className={`btn ${selectedPhoto.isThumbnail ? 'btn-secondary' : 'btn-yellow'}`}
              style={{ width: '100%', marginTop: '10px', boxShadow: 'none' }}
              onClick={() => {
                toggleSelectThumbnail(selectedPhoto.id, selectedPhoto.album, selectedPhoto.isThumbnail);
                setSelectedPhoto({ ...selectedPhoto, isThumbnail: !selectedPhoto.isThumbnail });
              }}
            >
              {selectedPhoto.isThumbnail ? '★ 대표 사진 해제' : '⭐ 이 앨범의 대표 사진으로 설정'}
            </button>
          </div>
        </div>
      )}

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