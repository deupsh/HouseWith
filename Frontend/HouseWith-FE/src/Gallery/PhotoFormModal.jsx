import React, { useState, useRef, useEffect } from 'react';
import noImage from '../assets/no-image.png';

const PhotoFormModal = ({ onClose, onSave, editingPhoto, albums, onDeleteClick }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [albumInput, setAlbumInput] = useState('기본 앨범');
  const [newAlbumInput, setNewAlbumInput] = useState('');
  const [isNewAlbum, setIsNewAlbum] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // 컴포넌트가 열릴 때, '수정' 모드라면 기존 데이터를 안전하게 채워줍니다.
  useEffect(() => {
    if (editingPhoto) {
      setTitle(editingPhoto.title || '');
      setDate(editingPhoto.date || '');
      setAlbumInput(editingPhoto.album || '기본 앨범');
      setPhotoUrl(editingPhoto.url || '');
      setFileName('기존 사진 유지됨');
    }
  }, [editingPhoto]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFileName('');
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('사진 크기는 20MB를 초과할 수 없습니다.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    const fakeUrl = URL.createObjectURL(file);
    setPhotoUrl(fakeUrl);
    setFileName(file.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (title.trim().length < 1 || title.trim().length > 20) {
      setError('제목은 1~20자 사이로 입력해 주세요.');
      return;
    }

    if (!editingPhoto && !photoUrl) {
      setError('업로드할 사진을 선택해 주세요.');
      return;
    }

    const finalDate = date || new Date().toISOString().split('T')[0];
    const finalAlbum = isNewAlbum ? (newAlbumInput.trim() || '기본 앨범') : albumInput;

    if (isNewAlbum && newAlbumInput.trim().length > 20) {
      setError('앨범 이름은 20자 이내로 입력해 주세요.');
      return;
    }

    // 부모 컴포넌트(Gallery.jsx)로 정리된 데이터를 올려보냅니다.
    onSave({
      title: title.trim(),
      date: finalDate,
      album: finalAlbum,
      url: photoUrl || noImage,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content gallery-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-icon-btn" onClick={onClose}>✕</button>
        <h2>{editingPhoto ? '사진 정보 수정' : '사진 추가하기'}</h2>

        <form onSubmit={handleSubmit} className="modal-form-container">
          <div className="form-field">
            <label>사진 선택 {editingPhoto ? '(변경 시에만 선택)' : '(최대 20MB)'}</label>
            <div className="file-upload-wrapper">
              <input 
                type="file" id="custom-file-input" accept="image/*" 
                onChange={handleFileChange} ref={fileInputRef} 
                required={!editingPhoto} className="hidden-file-input"
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
              type="text" placeholder="사진에 대한 짧은 제목 (1~20자)" maxLength={20}
              value={title} onChange={(e) => setTitle(e.target.value)} required
            />
          </div>

          <div className="form-field">
            <label>촬영 날짜 <span className="sub-label">(미입력 시 오늘 날짜)</span></label>
            <input type="date" className="styled-date-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="form-field">
            <label>앨범 선택 <span className="sub-label">(미입력 시 기본 앨범)</span></label>
            <select 
              className="styled-select" 
              value={isNewAlbum ? 'new' : albumInput}
              onChange={(e) => {
                if (e.target.value === 'new') setIsNewAlbum(true);
                else { setIsNewAlbum(false); setAlbumInput(e.target.value); }
              }}
            >
              {albums.map((a) => <option key={a} value={a}>{a}</option>)}
              <option value="new">직접 입력</option>
            </select>

            {isNewAlbum && (
              <input
                type="text" placeholder="새로운 앨범 이름을 입력하세요 (1~20자)" maxLength={20}
                value={newAlbumInput} onChange={(e) => setNewAlbumInput(e.target.value)}
                style={{ marginTop: '10px' }} className="fade-in"
              />
            )}
          </div>

          {error && <div className="gallery-error">{error}</div>}

          <div className="btn-group btn-group-two modal-btn-margin">
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {editingPhoto ? '저장하기' : '업로드 하기'}
            </button>
            {editingPhoto && (
              <button type="button" className="btn btn-danger" onClick={() => onDeleteClick(editingPhoto.id)}>삭제</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotoFormModal;