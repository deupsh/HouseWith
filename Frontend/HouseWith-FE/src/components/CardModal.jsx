import React from 'react';
import { X } from 'lucide-react';

const CardModal = ({ 
  isOpen, 
  onClose, 
  title, 
  showCloseBtn = false, 
  contentClassName = "text-center-modal", 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className={`modal-content ${contentClassName}`} onClick={(e) => e.stopPropagation()}>
        
        {/* 1. X 버튼이 포함된 헤더 형식 */}
        {showCloseBtn && title && (
          <div className="modal-header centered-header">
            <h3 className="no-margin-title">{title}</h3>
            <button className="close-btn top-right-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        )}

        {/* 2. X 버튼 없이 제목만 있는 형식 */}
        {!showCloseBtn && title && (
          <h3 className="menu-modal-title">{title}</h3>
        )}

        {/* 3. 모달 내부 진짜 콘텐츠 (폼, 텍스트, 버튼 등) */}
        {children}

      </div>
    </div>
  );
};

export default CardModal;