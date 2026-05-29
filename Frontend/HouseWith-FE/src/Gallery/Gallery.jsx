import React, { useState, useEffect } from 'react';
import './Gallery.css';
import axios from 'axios';
import PhotoFormModal from './PhotoFormModal';

// 백엔드 연결 전 UI 테스트용 가짜 데이터
const INITIAL_ALBUMS = ['기본 앨범', '가족 여행', '우리집 반려 동물'];
const INITIAL_PHOTOS = [
  { id: 1, title: '맛있는 저녁 식사', date: '2026-05-18', album: '기본 앨범', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', isThumbnail: false },
  { id: 2, title: '제주도 바다에서', date: '2026-05-19', album: '가족 여행', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', isThumbnail: true },
  { id: 3, title: '댕댕이 낮잠 시간', date: '2026-05-20', album: '우리집 반려 동물', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500', isThumbnail: false },
];

const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState('전체 보기'); 

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const [editingPhoto, setEditingPhoto] = useState(null); 
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  // 전체 사진 목록 가져오기 (GET)
  // 1. 앨범 목록만 따로 가져오는 독립적인 함수 신설
  const fetchAlbums = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // 백엔드에 앨범 목록 요청 (문자열 배열로 받는다고 가정)
      const response = await axios.get('/api/albums', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fetchedAlbums = response.data;
      setAlbums(['기본 앨범', ...fetchedAlbums.filter(a => a !== '기본 앨범')]);
    } catch (error) {
      console.error("앨범 목록 조회 실패:", error);
    }
  };

  // 2. 기존 fetchPhotos 내부의 앨범 탭 갱신 삭제
  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get('/api/photos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const formattedPhotos = response.data.map(p => ({
        id: p.photoId,
        title: p.title,
        date: p.date,
        album: p.album,
        url: `http://${window.location.hostname}/uploads/photo/${p.fileName}`, 
        isThumbnail: p.thumbnail
      }));
      
      setPhotos(formattedPhotos);
      
    } catch (error) {
      console.error("사진첩 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchAlbums();
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
      
      // 1. 지울 사진의 정보(앨범명 등)를 미리 찾아둠
      const photoToDeleteInfo = photos.find(p => p.id === photoToDelete);
      
      await axios.delete(`/api/photos/${photoToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. 화면에서 사진 제거 (기존 로직)
      const updatedPhotos = photos.filter(p => p.id !== photoToDelete);
      setPhotos(updatedPhotos);
      
      // 3. 프론트엔드 가비지 컬렉션 동기화 및 탭 이동 UX
      if (photoToDeleteInfo && photoToDeleteInfo.album !== '기본 앨범') {
        // 방금 지운 사진이 속했던 앨범에 남은 사진이 0장인지 확인
        const remainingInAlbum = updatedPhotos.filter(p => p.album === photoToDeleteInfo.album).length;
        
        if (remainingInAlbum === 0) {
          // 백엔드에서 앨범이 삭제되었으므로 프론트엔드 탭 목록도 즉시 새로고침!
          await fetchAlbums();
          
          // 만약 유저가 지금 텅 비어서 삭제된 그 앨범 탭을 보고 있었다면, 허공에 남지 않게 '전체 보기'로 이동시켜 줌
          if (currentAlbum === photoToDeleteInfo.album) {
            setCurrentAlbum('전체 보기');
          }
        }
      }
      
    } catch (error) {
      console.error("사진 삭제 실패:", error);
      // 에러 팝업 추가
      const errorMsg = error.response?.data?.message || "사진을 삭제할 권한이 없거나 실패했습니다.";
      alert(errorMsg);
    } finally {
      setIsConfirmOpen(false);
      setPhotoToDelete(null);
    }
  };

  // 4. 사진 업로드 및 수정 (POST / PUT)
  const handleSavePhoto = async (photoData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const profileId = localStorage.getItem('currentSlotId'); // 현재 프로필 ID 가져오기

      if (editingPhoto) {
        // ----------------------------------------------------
        // [수정 - PUT] : 백엔드의 @ModelAttribute 방식에 맞춤
        // ----------------------------------------------------
        const formData = new FormData();
        formData.append('title', photoData.title);
        formData.append('date', photoData.date);
        formData.append('album', photoData.album);
        
        // 새로 첨부한 파일이 있을 때만 넘겨줌
        if (photoData.file) {
          formData.append('photo', photoData.file); 
        }

        await axios.put(`/api/photos/${editingPhoto.id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        // 성공 시 로컬 화면 갱신
        setPhotos(photos.map(p => 
          p.id === editingPhoto.id 
            ? { ...p, title: photoData.title, date: photoData.date, album: photoData.album, url: photoData.url } 
            : p
        ));

      } else {
        // ----------------------------------------------------
        // [등록 - POST] : 백엔드의 @RequestPart 방식에 맞춤
        // ----------------------------------------------------
        const formData = new FormData();
        formData.append('file', photoData.file); // 파일 객체

        // 메타데이터는 Blob으로 감싸서 application/json 타입으로 넘김
        const metadata = {
          title: photoData.title,
          date: photoData.date,
          album: photoData.album
        };
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

        const response = await axios.post('/api/photos', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            ProfileId: profileId, // 누락되었던 헤더 추가!
            'Content-Type': 'multipart/form-data' 
          }
        });

        // 성공 시 로컬 화면에 방금 올린 사진 추가 (response.data에 새 사진의 ID가 들어옴)
        const newPhoto = {
          id: response.data, 
          title: photoData.title,
          date: photoData.date,
          album: photoData.album,
          url: photoData.url, 
          isThumbnail: false
        };
        setPhotos([newPhoto, ...photos]); 
      }

      // 새 앨범 이름이 입력되었다면 앨범 탭에 추가
      if (!albums.includes(photoData.album)) {
        setAlbums([...albums, photoData.album]);
      }
      
      setIsUploadOpen(false); // 모달 닫기

    } catch (error) {
      console.error("사진 저장 실패:", error);
      // 하드코딩된 alert 대신 백엔드 에러 메시지 띄워주기
      const errorMsg = error.response?.data?.message || "사진 저장 중 오류가 발생했습니다.";
      alert(errorMsg);
    }
  };

  // 🌟 5. 대표 사진 설정 (PATCH 또는 PUT)
  const setAsThumbnail = async (photoId, albumName) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // 백엔드 PATCH 명세 호출 (이제 해제가 없으므로 상태값을 보낼 필요도 없습니다)
      await axios.patch(`/api/photos/${photoId}/thumbnail`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // 로컬 업데이트: 방금 누른 사진만 true, 같은 앨범의 나머지 사진은 전부 false로 밀어버림
      setPhotos(
        photos.map((p) => {
          if (p.album === albumName) {
            if (p.id === photoId) return { ...p, isThumbnail: true }; 
            return { ...p, isThumbnail: false }; 
          }
          return p;
        })
      );
    } catch (error) {
      console.error("대표 사진 변경 실패:", error);
      // 에러 팝업 추가
      const errorMsg = error.response?.data?.message || "대표 사진을 변경할 수 없습니다.";
      alert(errorMsg);
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

            {photos.filter(p => p.album === selectedPhoto.album).length > 1 && (
              <button
                type="button"
                className={`btn ${selectedPhoto.isThumbnail ? 'btn-secondary' : 'btn-yellow'}`}
                style={{ width: '100%', marginTop: '10px', boxShadow: 'none' }}
                disabled={selectedPhoto.isThumbnail} // 이미 대표 사진이면 클릭(중복 요청) 방지
                onClick={() => {
                  setAsThumbnail(selectedPhoto.id, selectedPhoto.album);
                  setSelectedPhoto({ ...selectedPhoto, isThumbnail: true }); // 무조건 true로 고정
                }}
              >
                {/* 해제라는 말을 없애고, 현재 상태를 직관적으로 알려줌 */}
                {selectedPhoto.isThumbnail ? '⭐ 현재 앨범의 대표 사진입니다' : '⭐ 이 앨범의 대표 사진으로 설정'}
              </button>
            )}
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